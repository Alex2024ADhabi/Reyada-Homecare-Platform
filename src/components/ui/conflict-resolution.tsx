import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  GitMerge,
  Clock,
  User,
  Server,
  Eye,
  Download,
  ArrowRight,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";

interface ConflictData {
  id: string;
  type: "patient" | "clinical_form" | "assessment" | "service_initiation";
  title: string;
  description: string;
  localData: any;
  remoteData: any;
  conflictFields: string[];
  timestamp: string;
  priority: "low" | "medium" | "high" | "critical";
  autoResolvable: boolean;
  confidence: number;
}

interface ConflictResolutionProps {
  conflicts: ConflictData[];
  onResolveConflict: (
    conflictId: string,
    resolution: "use_local" | "use_remote" | "merge",
    mergedData?: any,
  ) => Promise<void>;
  onResolveAll: (
    resolutions: Array<{
      conflictId: string;
      resolution: "use_local" | "use_remote" | "merge";
      mergedData?: any;
    }>,
  ) => Promise<void>;
  className?: string;
}

export function ConflictResolution({
  conflicts,
  onResolveConflict,
  onResolveAll,
  className = "",
}: ConflictResolutionProps) {
  const { toast } = useToastContext();
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(
    null,
  );
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(
    new Set(),
  );
  const [mergedData, setMergedData] = useState<any>({});
  const [autoResolveMode, setAutoResolveMode] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "patient":
        return <User className="h-4 w-4" />;
      case "clinical_form":
        return <CheckCircle className="h-4 w-4" />;
      case "assessment":
        return <Eye className="h-4 w-4" />;
      case "service_initiation":
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleResolveConflict = async (
    conflictId: string,
    resolution: "use_local" | "use_remote" | "merge",
  ) => {
    setResolvingConflicts((prev) => new Set(prev).add(conflictId));

    try {
      const resolvedData =
        resolution === "merge" ? mergedData[conflictId] : undefined;
      await onResolveConflict(conflictId, resolution, resolvedData);

      toast({
        title: "Conflict Resolved",
        description: `Successfully resolved conflict using ${resolution.replace("_", " ")} strategy`,
        variant: "success",
      });

      if (selectedConflict?.id === conflictId) {
        setSelectedConflict(null);
      }
    } catch (error) {
      toast({
        title: "Resolution Failed",
        description: "Failed to resolve conflict. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolvingConflicts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(conflictId);
        return newSet;
      });
    }
  };

  const handleAutoResolveAll = async () => {
    const autoResolvableConflicts = conflicts.filter((c) => c.autoResolvable);

    if (autoResolvableConflicts.length === 0) {
      toast({
        title: "No Auto-Resolvable Conflicts",
        description: "All conflicts require manual resolution",
        variant: "warning",
      });
      return;
    }

    const resolutions = autoResolvableConflicts.map((conflict) => ({
      conflictId: conflict.id,
      resolution:
        conflict.confidence > 0.8 ? ("merge" as const) : ("use_local" as const),
    }));

    try {
      await onResolveAll(resolutions);
      toast({
        title: "Auto-Resolution Complete",
        description: `Automatically resolved ${resolutions.length} conflicts`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Auto-Resolution Failed",
        description: "Some conflicts could not be auto-resolved",
        variant: "destructive",
      });
    }
  };

  const renderFieldComparison = (conflict: ConflictData) => {
    return (
      <div className="space-y-4">
        {conflict.conflictFields.map((field) => {
          const localValue = conflict.localData[field];
          const remoteValue = conflict.remoteData[field];

          return (
            <div key={field} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 capitalize">
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <User className="h-4 w-4 mr-1" />
                    Local Version
                  </div>
                  <div className="p-3 bg-blue-50 rounded border">
                    <pre className="text-sm whitespace-pre-wrap">
                      {typeof localValue === "object"
                        ? JSON.stringify(localValue, null, 2)
                        : String(localValue || "N/A")}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <Server className="h-4 w-4 mr-1" />
                    Remote Version
                  </div>
                  <div className="p-3 bg-green-50 rounded border">
                    <pre className="text-sm whitespace-pre-wrap">
                      {typeof remoteValue === "object"
                        ? JSON.stringify(remoteValue, null, 2)
                        : String(remoteValue || "N/A")}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Merge option */}
              <div className="mt-4 p-3 bg-purple-50 rounded border">
                <div className="flex items-center text-sm font-medium text-purple-600 mb-2">
                  <GitMerge className="h-4 w-4 mr-1" />
                  Merged Version (Editable)
                </div>
                <textarea
                  className="w-full p-2 border rounded text-sm font-mono"
                  rows={3}
                  value={mergedData[conflict.id]?.[field] || localValue || ""}
                  onChange={(e) => {
                    setMergedData((prev) => ({
                      ...prev,
                      [conflict.id]: {
                        ...prev[conflict.id],
                        [field]: e.target.value,
                      },
                    }));
                  }}
                  placeholder="Enter merged value..."
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (conflicts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Conflicts Found
          </h3>
          <p className="text-gray-600">
            All data has been synchronized successfully without conflicts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Data Conflicts ({conflicts.length})
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={handleAutoResolveAll}
                variant="outline"
                size="sm"
                disabled={
                  conflicts.filter((c) => c.autoResolvable).length === 0
                }
              >
                <GitMerge className="h-4 w-4 mr-1" />
                Auto-Resolve ({conflicts.filter((c) => c.autoResolvable).length}
                )
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data conflicts have been detected during synchronization. Please
              review and resolve each conflict to ensure data integrity.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Conflicts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conflicts Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedConflict?.id === conflict.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(conflict.type)}
                      <h4 className="font-medium">{conflict.title}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <Badge className={getPriorityColor(conflict.priority)}>
                        {conflict.priority}
                      </Badge>
                      {conflict.autoResolvable && (
                        <Badge variant="outline" className="text-green-600">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {conflict.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(conflict.timestamp).toLocaleString()}
                    </span>
                    <span>{conflict.conflictFields.length} field(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conflict Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedConflict ? "Conflict Details" : "Select a Conflict"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConflict ? (
              <Tabs defaultValue="comparison" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comparison">Field Comparison</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-4">
                  {renderFieldComparison(selectedConflict)}

                  {/* Resolution Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      onClick={() =>
                        handleResolveConflict(selectedConflict.id, "use_local")
                      }
                      disabled={resolvingConflicts.has(selectedConflict.id)}
                      variant="outline"
                      className="flex items-center"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Use Local
                    </Button>

                    <Button
                      onClick={() =>
                        handleResolveConflict(selectedConflict.id, "use_remote")
                      }
                      disabled={resolvingConflicts.has(selectedConflict.id)}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Server className="h-4 w-4 mr-1" />
                      Use Remote
                    </Button>

                    <Button
                      onClick={() =>
                        handleResolveConflict(selectedConflict.id, "merge")
                      }
                      disabled={resolvingConflicts.has(selectedConflict.id)}
                      className="flex items-center"
                    >
                      <GitMerge className="h-4 w-4 mr-1" />
                      Use Merged
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Conflict Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Type:</strong> {selectedConflict.type}
                        </div>
                        <div>
                          <strong>Priority:</strong> {selectedConflict.priority}
                        </div>
                        <div>
                          <strong>Auto-resolvable:</strong>{" "}
                          {selectedConflict.autoResolvable ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Confidence:</strong>{" "}
                          {Math.round(selectedConflict.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Conflicting Fields</h4>
                      <div className="space-y-1">
                        {selectedConflict.conflictFields.map((field) => (
                          <Badge
                            key={field}
                            variant="outline"
                            className="mr-1 mb-1"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select a conflict from the list to view details and resolve
                  it.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConflictResolution;
