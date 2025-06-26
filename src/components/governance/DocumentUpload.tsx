import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Eye,
  Send,
  Users,
  Bell,
  Shield,
  Clock,
  Tag,
  FileCheck,
  Zap,
} from "lucide-react";
import {
  governanceRegulationsAPI,
  DocumentType,
  DocumentCategory,
  ComplianceFramework,
  DocumentClassification,
} from "@/api/governance-regulations.api";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  documentId?: string;
}

interface NotificationSettings {
  notifyAllStaff: boolean;
  notifyDepartments: string[];
  notifyRoles: string[];
  urgentNotification: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  acknowledgmentRequired: boolean;
}

const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);

  // Form state
  const [documentType, setDocumentType] = useState<DocumentType>("policy");
  const [documentCategory, setDocumentCategory] =
    useState<DocumentCategory>("healthcare");
  const [classification, setClassification] = useState<DocumentClassification>({
    level: "internal",
    sensitivity: "medium",
    retentionPeriod: 5,
    accessControl: ["all_staff"],
    complianceFrameworks: ["DOH"],
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoClassify, setAutoClassify] = useState(true);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      notifyAllStaff: true,
      notifyDepartments: [],
      notifyRoles: [],
      urgentNotification: false,
      emailNotification: true,
      smsNotification: false,
      acknowledgmentRequired: true,
    });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    const completed: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Update file status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploading" } : f,
          ),
        );

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f)),
          );
        }

        // Upload document
        const uploadRequest = {
          file: file.file,
          metadata: {
            originalFileName: file.file.name,
            fileSize: file.file.size,
            mimeType: file.file.type,
            uploadedAt: new Date().toISOString(),
            source: "governance_library",
            jurisdiction: "UAE",
            approvalStatus: autoPublish ? "approved" : ("pending" as const),
            approvedBy: autoPublish ? "System Auto-Approval" : undefined,
            approvedAt: autoPublish ? new Date().toISOString() : undefined,
          },
          classification,
          tags,
        };

        // In a real implementation, this would call the actual API
        // const response = await governanceRegulationsAPI.uploadDocument(uploadRequest);

        // Simulate API response
        const mockResponse = {
          documentId: `doc-${Date.now()}-${i}`,
          status: "success" as const,
          message: "Document uploaded successfully",
        };

        // Update file status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "processing",
                  documentId: mockResponse.documentId,
                }
              : f,
          ),
        );

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update file status to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "completed" } : f,
          ),
        );

        completed.push(mockResponse.documentId);
      } catch (error) {
        console.error(`Error uploading file ${file.file.name}:`, error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : f,
          ),
        );
      }

      // Update overall progress
      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setCompletedUploads(completed);
    setIsUploading(false);

    // Show notification dialog if auto-publish is enabled
    if (autoPublish && completed.length > 0) {
      setShowNotificationDialog(true);
    }
  };

  const sendNotifications = async () => {
    try {
      // In a real implementation, this would call the notification service
      console.log("Sending notifications:", {
        documents: completedUploads,
        settings: notificationSettings,
      });

      // Simulate notification sending
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `Notifications sent to staff about ${completedUploads.length} new document(s)!`,
      );
      setShowNotificationDialog(false);

      // Reset form
      setFiles([]);
      setCompletedUploads([]);
      setTags([]);
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Failed to send notifications. Please try again.");
    }
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "uploading":
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "processing":
        return <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Upload className="h-8 w-8 mr-3 text-blue-600" />
          Document Upload & Publishing
        </h1>
        <p className="text-gray-600 mt-2">
          Upload governance and regulatory documents to the library with
          automatic publishing and staff notifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PDF, DOC, DOCX, TXT files up to 50MB
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) =>
                    e.target.files && handleFiles(Array.from(e.target.files))
                  }
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-gray-900">Selected Files</h3>
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {file.status === "uploading" && (
                            <Progress
                              value={file.progress}
                              className="mt-1 h-1"
                            />
                          )}
                          {file.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                        {file.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {file.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(file);
                              setShowPreview(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Upload Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={uploadFiles}
                  disabled={files.length === 0 || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Publish
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Document Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) =>
                    setDocumentType(value as DocumentType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="directive">Directive</SelectItem>
                    <SelectItem value="framework">Framework</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="document-category">Category</Label>
                <Select
                  value={documentCategory}
                  onValueChange={(value) =>
                    setDocumentCategory(value as DocumentCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="administrative">
                      Administrative
                    </SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="classification-level">
                  Classification Level
                </Label>
                <Select
                  value={classification.level}
                  onValueChange={(value) =>
                    setClassification((prev) => ({
                      ...prev,
                      level: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sensitivity">Sensitivity</Label>
                <Select
                  value={classification.sensitivity}
                  onValueChange={(value) =>
                    setClassification((prev) => ({
                      ...prev,
                      sensitivity: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-publish">Auto-Publish</Label>
                  <p className="text-xs text-gray-600">
                    Automatically publish after upload
                  </p>
                </div>
                <Switch
                  id="auto-publish"
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-classify">Auto-Classify</Label>
                  <p className="text-xs text-gray-600">
                    Use AI to classify documents
                  </p>
                </div>
                <Switch
                  id="auto-classify"
                  checked={autoClassify}
                  onCheckedChange={setAutoClassify}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notify-staff">Notify Staff</Label>
                  <p className="text-xs text-gray-600">
                    Send notifications when published
                  </p>
                </div>
                <Switch
                  id="notify-staff"
                  checked={notificationSettings.notifyAllStaff}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      notifyAllStaff: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-ack">Require Acknowledgment</Label>
                  <p className="text-xs text-gray-600">
                    Staff must acknowledge receipt
                  </p>
                </div>
                <Switch
                  id="require-ack"
                  checked={notificationSettings.acknowledgmentRequired}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      acknowledgmentRequired: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Dialog */}
      <Dialog
        open={showNotificationDialog}
        onOpenChange={setShowNotificationDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Send Staff Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">
                {completedUploads.length} Document(s) Published Successfully!
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Ready to notify all staff about the new governance documents?
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Users className="h-4 w-4" />
                <span>
                  All Staff (
                  {notificationSettings.notifyAllStaff ? "Enabled" : "Disabled"}
                  )
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-800 mt-1">
                <Shield className="h-4 w-4" />
                <span>
                  Acknowledgment Required (
                  {notificationSettings.acknowledgmentRequired ? "Yes" : "No"})
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotificationDialog(false)}
            >
              Skip Notifications
            </Button>
            <Button
              onClick={sendNotifications}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Document Preview
            </DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-700">File Name</Label>
                  <p>{selectedFile.file.name}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">File Size</Label>
                  <p>{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">
                    Document ID
                  </Label>
                  <p className="font-mono text-xs">{selectedFile.documentId}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusColor(selectedFile.status)}>
                    {selectedFile.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Document has been successfully uploaded and published to the
                  governance library. Staff will be notified and can access it
                  immediately.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUpload;
