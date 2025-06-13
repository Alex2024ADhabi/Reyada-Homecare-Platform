import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Download,
} from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { useToastContext } from "@/components/ui/toast-provider";

interface JsonDebuggerProps {
  initialJson?: string;
  onValidJson?: (json: string) => void;
  className?: string;
}

export default function JsonDebugger({
  initialJson = "",
  onValidJson,
  className,
}: JsonDebuggerProps) {
  const { toast } = useToastContext();
  const [jsonInput, setJsonInput] = useState(initialJson);
  const [validationResult, setValidationResult] = useState<any>(null);
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
      } else {
        const errorCount = result.errors.length;
        toast({
          title: `❌ Invalid JSON (${errorCount} issue${errorCount > 1 ? "s" : ""})`,
          description: result.correctedJson
            ? "Auto-fix suggestions available"
            : "Please review and fix the errors",
          variant: "destructive",
        });
      }
    } catch (error) {
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
    } finally {
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
      } catch (firstError) {
        // Try auto-fix first, then format
        const autoFixed = JsonValidator.validate(jsonInput);
        if (autoFixed.correctedJson) {
          formatted = JsonValidator.format(autoFixed.correctedJson, 2);
          toast({
            title: "JSON Auto-Fixed & Formatted",
            description: "JSON was automatically corrected and formatted",
            variant: "success",
          });
        } else {
          throw firstError;
        }
      }

      setJsonInput(formatted);

      if (!toast.title?.includes("Auto-Fixed")) {
        toast({
          title: "✨ JSON Formatted",
          description:
            "JSON has been properly formatted with 2-space indentation",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("JSON formatting error:", error);
      toast({
        title: "Format Error",
        description:
          error instanceof Error ? error.message : "Cannot format invalid JSON",
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
      } else if (!validationResult.isValid) {
        toast({
          title: "Invalid JSON",
          description: "Cannot download invalid JSON. Please fix errors first.",
          variant: "destructive",
        });
        return;
      }

      // Safely create blob with validated JSON
      const safeJson = JsonValidator.safeStringify(
        JSON.parse(jsonToDownload),
        2,
      );
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
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-white space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            JSON Debugger & Validator
          </h2>
          <p className="text-gray-600 mt-1">
            Validate, format, and fix JSON syntax issues
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {validationResult && (
            <Badge
              className={
                validationResult.isValid
                  ? "text-green-600 bg-green-100"
                  : "text-red-600 bg-red-100"
              }
            >
              {validationResult.isValid ? "VALID" : "INVALID"}
            </Badge>
          )}
        </div>
      </div>

      {/* JSON Input */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Input</CardTitle>
          <CardDescription>
            Paste your JSON here to validate and debug
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="min-h-[300px] font-mono text-sm"
          />

          <div className="flex items-center space-x-2 mt-4">
            <Button onClick={validateJson} disabled={isValidating}>
              {isValidating ? "Validating..." : "Validate JSON"}
            </Button>
            <Button variant="outline" onClick={formatJson}>
              Format JSON
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={downloadJson}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.isValid ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Valid JSON</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your JSON is properly formatted and valid.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Invalid JSON</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {validationResult.errors.length} error(s) found:
                    <ul className="list-disc list-inside mt-2">
                      {validationResult.errors.map(
                        (error: string, index: number) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ),
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>

                {validationResult.correctedJson && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      Auto-fix Available
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      We found potential fixes for your JSON.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={applyAutoFix}
                      >
                        Apply Auto-fix
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* JSON Formatting Rules */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Formatting Rules</CardTitle>
          <CardDescription>
            Common rules to follow for valid JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JsonValidator.getFormattingRules().map((rule, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common JSON Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Common JSON Errors & Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-red-800">Trailing Commas</h4>
              <p className="text-sm text-gray-600">❌ {`{"key": "value",}`}</p>
              <p className="text-sm text-gray-600">✅ {`{"key": "value"}`}</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-red-800">Single Quotes</h4>
              <p className="text-sm text-gray-600">❌ {`{'key': 'value'}`}</p>
              <p className="text-sm text-gray-600">✅ {`{"key": "value"}`}</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-red-800">Unquoted Keys</h4>
              <p className="text-sm text-gray-600">❌ {`{key: "value"}`}</p>
              <p className="text-sm text-gray-600">✅ {`{"key": "value"}`}</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-red-800">Unescaped Quotes</h4>
              <p className="text-sm text-gray-600">
                ❌ {`{"message": "He said "Hello""}`}
              </p>
              <p className="text-sm text-gray-600">
                ✅ {`{"message": "He said \"Hello\""}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
