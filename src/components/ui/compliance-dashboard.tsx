import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { EnhancedToast } from "./enhanced-toast";
import { Progress } from "./progress";
import { CheckCircle, AlertTriangle, Clock, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceItem {
  id: string;
  title: string;
  status: "compliant" | "non-compliant" | "pending" | "warning";
  level: "critical" | "high" | "medium" | "low";
  dohRequirement: string;
  description: string;
  lastChecked: Date;
  remediation?: {
    steps: string[];
    actionLabel: string;
    onAction: () => void;
  };
}

interface ComplianceDashboardProps {
  items: ComplianceItem[];
  overallScore: number;
  onRefresh: () => void;
  onItemAction: (itemId: string, action: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  items,
  overallScore,
  onRefresh,
  onItemAction,
}) => {
  const [toasts, setToasts] = React.useState<any[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<ComplianceItem | null>(
    null,
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "non-compliant":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-emerald-600";
      case "non-compliant":
        return "text-red-600";
      case "pending":
        return "text-blue-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const criticalItems = items.filter((item) => item.level === "critical");
  const nonCompliantItems = items.filter(
    (item) => item.status === "non-compliant",
  );
  const pendingItems = items.filter((item) => item.status === "pending");

  const addToast = (toast: any) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now().toString() }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleItemClick = (item: ComplianceItem) => {
    setSelectedItem(item);

    if (item.status === "non-compliant" && item.level === "critical") {
      addToast({
        title: "Critical Compliance Issue",
        description: `${item.title} requires immediate attention`,
        variant: "compliance-error",
        complianceLevel: "critical",
        dohRequirement: item.dohRequirement,
        remediation: item.remediation,
        persistent: true,
      });
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <EnhancedToast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DOH 2025 Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage DOH Claims and Adjudication Rules compliance
          </p>
        </div>
        <Button
          onClick={onRefresh}
          complianceAction="validate"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Refresh Compliance Status
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall Compliance Score
            <Badge
              complianceLevel={
                overallScore >= 90
                  ? "passed"
                  : overallScore >= 70
                    ? "medium"
                    : "critical"
              }
              statusIcon
            >
              {overallScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0%</span>
            <span>Target: 95%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <Alert variant="compliance-critical" className="bg-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Compliance Issues Detected</AlertTitle>
          <AlertDescription>
            {criticalItems.length} critical issue
            {criticalItems.length > 1 ? "s" : ""} require immediate attention to
            maintain DOH compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">
                  {nonCompliantItems.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingItems.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalItems.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Compliance Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  item.level === "critical" && "border-l-4 border-l-red-600",
                  item.level === "high" && "border-l-4 border-l-orange-500",
                  item.level === "medium" && "border-l-4 border-l-yellow-500",
                  item.level === "low" && "border-l-4 border-l-blue-500",
                )}
                onClick={() => handleItemClick(item)}
                complianceLevel={item.level}
                actionRequired={item.status === "non-compliant"}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(item.status)}
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge complianceLevel={item.level} statusIcon>
                          {item.level}
                        </Badge>
                        <Badge
                          variant={
                            item.status === "compliant"
                              ? "compliance-passed"
                              : "compliance-critical"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium">
                        DOH Requirement: {item.dohRequirement}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last checked: {item.lastChecked.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.remediation && (
                        <Button
                          size="sm"
                          variant="outline"
                          complianceAction="remediate"
                          onClick={(e) => {
                            e.stopPropagation();
                            item.remediation?.onAction();
                          }}
                        >
                          {item.remediation.actionLabel}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        complianceAction="review"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemAction(item.id, "review");
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card className="bg-white" expandable>
          <CardHeader>
            <CardTitle>Compliance Details: {selectedItem.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Status Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        getStatusColor(selectedItem.status),
                      )}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Level:</span>
                    <Badge complianceLevel={selectedItem.level} statusIcon>
                      {selectedItem.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      DOH Requirement:
                    </span>
                    <span className="text-sm text-indigo-600 font-medium">
                      {selectedItem.dohRequirement}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.remediation && (
                <div>
                  <h4 className="font-semibold mb-2">Remediation Steps</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {selectedItem.remediation.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                  <Button
                    className="mt-3"
                    complianceAction="remediate"
                    onClick={selectedItem.remediation.onAction}
                  >
                    {selectedItem.remediation.actionLabel}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceDashboard;
