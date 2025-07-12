import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Download,
  Wrench,
} from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";

interface JsonErrorHandlerProps {
  data?: any;
  onDataFixed?: (fixedData: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showPreview?: boolean;
  autoFix?: boolean;
}

export const JsonErrorHandler: React.FC<JsonErrorHandlerProps> = ({
  data,
  onDataFixed,
  onError,
  className = "",
  showPreview = true,
  autoFix = true,
}) => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [showRawEditor, setShowRawEditor] = useState(false);

  useEffect(() => {
    if (data) {
      validateData(data);
    }
  }, [data]);

  const validateData = async (inputData: any) => {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown validation error";
      setValidationResult({
        isValid: false,
        errors: [errorMessage],
        data: null,
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleAutoFix = async () => {
    if (!rawJson) return;

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
        } else {
          setValidationResult({
            isValid: false,
            errors: ["Auto-fix failed to resolve all issues"],
            autoFixed: false,
          });
        }
      } else {
        setValidationResult({
          isValid: false,
          errors: ["Auto-fix could not repair the JSON structure"],
          autoFixed: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Auto-fix failed";
      setValidationResult({
        isValid: false,
        errors: [errorMessage],
        autoFixed: false,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualEdit = () => {
    setShowRawEditor(!showRawEditor);
  };

  const handleRawJsonChange = (value: string) => {
    setRawJson(value);
  };

  const handleValidateManual = () => {
    try {
      const parsedData = JSON.parse(rawJson);
      validateData(parsedData);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ["Invalid JSON syntax"],
        data: null,
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isValidating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : validationResult?.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            JSON Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating ? (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Validating data structure...</p>
            </div>
          ) : (
            <>
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    validationResult?.isValid ? "default" : "destructive"
                  }
                >
                  {validationResult?.isValid ? "Valid" : "Invalid"}
                </Badge>

                {validationResult?.sanitized && (
                  <Badge variant="secondary">Sanitized</Badge>
                )}

                {validationResult?.autoFixed && (
                  <Badge variant="outline">Auto-Fixed</Badge>
                )}

                {validationResult?.damanCompliant && (
                  <Badge variant="default">Daman Compliant</Badge>
                )}
              </div>

              {/* Errors */}
              {validationResult?.errors &&
                validationResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Validation Errors:</strong>
                        <ul className="list-disc list-inside">
                          {validationResult.errors.map(
                            (error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {!validationResult?.isValid && autoFix && (
                  <Button onClick={handleAutoFix} variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Auto-Fix
                  </Button>
                )}

                <Button onClick={handleManualEdit} variant="outline">
                  {showRawEditor ? "Hide" : "Show"} Raw JSON
                </Button>

                {rawJson && (
                  <>
                    <Button
                      onClick={() => copyToClipboard(rawJson)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>

                    <Button onClick={downloadJson} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Raw JSON Editor */}
      {showRawEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Raw JSON Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawJson}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className="font-mono text-sm min-h-64"
              placeholder="Enter or edit JSON data..."
            />

            <div className="flex gap-2">
              <Button onClick={handleValidateManual}>Validate</Button>

              <Button
                onClick={() => {
                  try {
                    const formatted = JSON.stringify(
                      JSON.parse(rawJson),
                      null,
                      2,
                    );
                    setRawJson(formatted);
                  } catch (error) {
                    // Invalid JSON, can't format
                  }
                }}
                variant="outline"
              >
                Format
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {showPreview && validationResult?.isValid && validationResult.data && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(validationResult.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JsonErrorHandler;
