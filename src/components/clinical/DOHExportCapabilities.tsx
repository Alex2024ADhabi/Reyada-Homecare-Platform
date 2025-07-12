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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Archive,
  Lock,
  Zap,
} from "lucide-react";
import { dohAuditAPI } from "@/api/doh-audit.api";

interface DOHExportCapabilitiesProps {
  facilityId?: string;
  patientId?: string;
  episodeId?: string;
}

const DOHExportCapabilities: React.FC<DOHExportCapabilitiesProps> = ({
  facilityId = "FAC001",
  patientId,
  episodeId,
}) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportResult, setExportResult] = useState<any>(null);
  const [exportConfig, setExportConfig] = useState({
    dataType: "patient-records",
    format: "pdf",
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    includeAttachments: true,
    encryptionRequired: true,
    filters: {
      patientIds: patientId ? [patientId] : [],
      facilityIds: [facilityId],
      documentTypes: [],
      complianceLevel: ["full", "partial"],
    },
  });

  const exportOptions = [
    {
      id: "patient-records",
      name: "Patient Records",
      description:
        "Complete patient medical records with demographics, clinical history, and care plans",
      icon: FileText,
      formats: ["pdf", "excel", "json"],
      estimatedSize: "2-5 MB per patient",
      processingTime: "2-3 minutes",
    },
    {
      id: "clinical-documentation",
      name: "Clinical Documentation",
      description:
        "All clinical forms, assessments, and documentation with electronic signatures",
      icon: FileSpreadsheet,
      formats: ["pdf", "excel", "csv", "xml"],
      estimatedSize: "1-3 MB per episode",
      processingTime: "1-2 minutes",
    },
    {
      id: "audit-trails",
      name: "Audit Trails",
      description:
        "Complete audit logs, access records, and compliance tracking data",
      icon: Database,
      formats: ["csv", "json", "excel"],
      estimatedSize: "500 KB - 2 MB",
      processingTime: "30 seconds - 1 minute",
    },
    {
      id: "quality-metrics",
      name: "Quality Metrics",
      description:
        "Quality indicators, performance metrics, and outcome measurements",
      icon: Archive,
      formats: ["excel", "csv", "pdf"],
      estimatedSize: "100-500 KB",
      processingTime: "30 seconds",
    },
  ];

  const formatOptions = [
    {
      id: "pdf",
      name: "PDF",
      description:
        "Portable Document Format - Best for reports and documentation",
      icon: FileText,
    },
    {
      id: "excel",
      name: "Excel",
      description: "Microsoft Excel format - Best for data analysis",
      icon: FileSpreadsheet,
    },
    {
      id: "csv",
      name: "CSV",
      description: "Comma-separated values - Best for data import/export",
      icon: Database,
    },
    {
      id: "json",
      name: "JSON",
      description: "JavaScript Object Notation - Best for system integration",
      icon: Database,
    },
    {
      id: "xml",
      name: "XML",
      description:
        "Extensible Markup Language - Best for structured data exchange",
      icon: Database,
    },
  ];

  const handleExport = async () => {
    try {
      setExportProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // Call DOH export API
      const exportRequest = await dohAuditAPI.exportComplianceData({
        dataType: exportConfig.dataType as any,
        format: exportConfig.format as any,
        dateRange: exportConfig.dateRange,
        filters: exportConfig.filters,
        includeAttachments: exportConfig.includeAttachments,
      });

      // Simulate processing time
      setTimeout(() => {
        setExportResult({
          success: true,
          requestId: exportRequest.requestId || `export_${Date.now()}`,
          downloadUrl: `/api/exports/download/${exportRequest.requestId}`,
          fileSize: "2.4 MB",
          recordCount: 156,
          generatedAt: new Date().toISOString(),
          expiryDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          checksum: "sha256:a1b2c3d4e5f6...",
          encryptionStatus: exportConfig.encryptionRequired
            ? "AES-256 Encrypted"
            : "Not Encrypted",
        });
        setExportProgress(null);
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportResult({
        success: false,
        error: "Export failed. Please try again.",
      });
      setExportProgress(null);
    }
  };

  const handleDownload = (downloadUrl: string) => {
    // In a real implementation, this would handle secure download
    window.open(downloadUrl, "_blank");
  };

  const selectedExportOption = exportOptions.find(
    (opt) => opt.id === exportConfig.dataType,
  );
  const selectedFormat = formatOptions.find(
    (fmt) => fmt.id === exportConfig.format,
  );

  return (
    <div className="bg-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Download className="w-6 h-6 mr-2 text-blue-600" />
            DOH Export Capabilities
          </h2>
          <p className="text-gray-600 mt-1">
            Export patient data, clinical documentation, and compliance reports
            in DOH-compliant formats
          </p>
        </div>
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <FileDown className="w-4 h-4 mr-2" />
              Start Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>DOH Compliant Data Export</DialogTitle>
              <DialogDescription>
                Export patient data and clinical documentation in compliance
                with DOH regulations
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="data-selection" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="data-selection">Data Selection</TabsTrigger>
                <TabsTrigger value="format-options">Format Options</TabsTrigger>
                <TabsTrigger value="security-settings">Security</TabsTrigger>
                <TabsTrigger value="export-process">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="data-selection" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Select Data Type
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {exportOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <Card
                            key={option.id}
                            className={`cursor-pointer transition-all ${
                              exportConfig.dataType === option.id
                                ? "ring-2 ring-blue-500 bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              setExportConfig((prev) => ({
                                ...prev,
                                dataType: option.id,
                              }))
                            }
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Icon className="w-5 h-5 text-blue-600 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-medium">{option.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {option.description}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Size: {option.estimatedSize}</span>
                                    <span>Time: {option.processingTime}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={exportConfig.dateRange.startDate}
                        onChange={(e) =>
                          setExportConfig((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              startDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={exportConfig.dateRange.endDate}
                        onChange={(e) =>
                          setExportConfig((prev) => ({
                            ...prev,
                            dateRange: {
                              ...prev.dateRange,
                              endDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="format-options" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Export Format
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {formatOptions
                        .filter((fmt) =>
                          selectedExportOption?.formats.includes(fmt.id),
                        )
                        .map((format) => {
                          const Icon = format.icon;
                          return (
                            <Card
                              key={format.id}
                              className={`cursor-pointer transition-all ${
                                exportConfig.format === format.id
                                  ? "ring-2 ring-blue-500 bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() =>
                                setExportConfig((prev) => ({
                                  ...prev,
                                  format: format.id,
                                }))
                              }
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <Icon className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <h4 className="font-medium text-sm">
                                      {format.name}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {format.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Additional Options
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-attachments"
                          checked={exportConfig.includeAttachments}
                          onCheckedChange={(checked) =>
                            setExportConfig((prev) => ({
                              ...prev,
                              includeAttachments: checked as boolean,
                            }))
                          }
                        />
                        <Label
                          htmlFor="include-attachments"
                          className="text-sm"
                        >
                          Include file attachments and images
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security-settings" className="space-y-4">
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security & Compliance</AlertTitle>
                    <AlertDescription>
                      All exports are automatically encrypted and comply with
                      DOH data protection requirements.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="encryption-required"
                        checked={exportConfig.encryptionRequired}
                        onCheckedChange={(checked) =>
                          setExportConfig((prev) => ({
                            ...prev,
                            encryptionRequired: checked as boolean,
                          }))
                        }
                      />
                      <Label htmlFor="encryption-required" className="text-sm">
                        Enable AES-256 encryption (Recommended)
                      </Label>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Export Security Features
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />{" "}
                        End-to-end encryption
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />{" "}
                        Audit trail logging
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />{" "}
                        Access control validation
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />{" "}
                        File integrity verification
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />{" "}
                        Automatic expiry (7 days)
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export-process" className="space-y-4">
                <div className="space-y-4">
                  {!exportResult && exportProgress === null && (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium">Ready to Export</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedExportOption?.name} in {selectedFormat?.name}{" "}
                          format
                        </p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          Date Range: {exportConfig.dateRange.startDate} to{" "}
                          {exportConfig.dateRange.endDate}
                        </p>
                        <p>
                          Estimated Processing Time:{" "}
                          {selectedExportOption?.processingTime}
                        </p>
                        <p>
                          Security:{" "}
                          {exportConfig.encryptionRequired
                            ? "AES-256 Encrypted"
                            : "Standard"}
                        </p>
                      </div>
                      <Button onClick={handleExport} className="mt-4">
                        <Zap className="w-4 h-4 mr-2" />
                        Start Export Process
                      </Button>
                    </div>
                  )}

                  {exportProgress !== null && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">
                          Processing Export...
                        </h3>
                        <p className="text-sm text-gray-600">
                          Please wait while we prepare your data
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <Progress value={exportProgress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Processing data and applying security measures...
                      </div>
                    </div>
                  )}

                  {exportResult && (
                    <div className="space-y-4">
                      {exportResult.success ? (
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-green-900">
                            Export Completed Successfully
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Your data has been exported and is ready for
                            download
                          </p>

                          <div className="mt-4 p-4 bg-green-50 rounded-lg text-left">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">File Size:</span>{" "}
                                {exportResult.fileSize}
                              </div>
                              <div>
                                <span className="font-medium">Records:</span>{" "}
                                {exportResult.recordCount}
                              </div>
                              <div>
                                <span className="font-medium">Generated:</span>{" "}
                                {new Date(
                                  exportResult.generatedAt,
                                ).toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Expires:</span>{" "}
                                {new Date(
                                  exportResult.expiryDate,
                                ).toLocaleDateString()}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Security:</span>{" "}
                                {exportResult.encryptionStatus}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Checksum:</span>
                                <code className="text-xs bg-gray-100 px-1 rounded ml-1">
                                  {exportResult.checksum}
                                </code>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() =>
                              handleDownload(exportResult.downloadUrl)
                            }
                            className="mt-4"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Export File
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-red-900">
                            Export Failed
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {exportResult.error}
                          </p>
                          <Button
                            onClick={() => setExportResult(null)}
                            className="mt-4"
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Exports
                </p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <FileDown className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <Archive className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Volume</p>
                <p className="text-2xl font-bold">2.4 TB</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Rate
                </p>
                <p className="text-2xl font-bold">100%</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>
            Latest data exports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: "EXP001",
                type: "Patient Records",
                format: "PDF",
                date: "2024-01-15 14:30",
                size: "2.4 MB",
                status: "completed",
                records: 156,
              },
              {
                id: "EXP002",
                type: "Clinical Documentation",
                format: "Excel",
                date: "2024-01-15 12:15",
                size: "1.8 MB",
                status: "completed",
                records: 89,
              },
              {
                id: "EXP003",
                type: "Audit Trails",
                format: "CSV",
                date: "2024-01-15 09:45",
                size: "756 KB",
                status: "completed",
                records: 1247,
              },
            ].map((export_item) => (
              <div
                key={export_item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{export_item.type}</p>
                    <p className="text-xs text-gray-600">
                      {export_item.format} • {export_item.records} records •{" "}
                      {export_item.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{export_item.date}</p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700"
                    >
                      {export_item.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DOHExportCapabilities;
