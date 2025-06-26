import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Users,
  Calendar,
  Settings,
  Bell,
  BookOpen,
  Shield,
  Archive,
  Tag,
  Share2,
  History,
  Lock,
  Unlock,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Database,
  FileCheck,
  Workflow,
} from "lucide-react";
import { governanceRegulationsAPI } from "@/api/governance-regulations.api";

interface Document {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  status: string;
  content: string;
  summary: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  effective_date: string;
  expiry_date: string;
  approval_workflow: {
    status: string;
    approvers: Array<{
      name: string;
      role: string;
      status: string;
      date?: string;
    }>;
  };
  compliance_requirements: string[];
  related_documents: string[];
  access_level: string;
  download_count: number;
  view_count: number;
  is_favorite: boolean;
  metadata: {
    file_size?: string;
    file_format?: string;
    language?: string;
    classification_confidence?: number;
  };
}

interface DocumentWorkflow {
  id: string;
  document_id: string;
  workflow_type: string;
  status: string;
  steps: Array<{
    step_name: string;
    assignee: string;
    status: string;
    due_date: string;
    completed_date?: string;
    comments?: string;
  }>;
  created_at: string;
  updated_at: string;
}

const DocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workflows, setWorkflows] = useState<DocumentWorkflow[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Document Form State
  const [documentForm, setDocumentForm] = useState({
    title: "",
    type: "policy",
    category: "governance",
    content: "",
    summary: "",
    tags: [] as string[],
    compliance_requirements: [] as string[],
    access_level: "internal",
    effective_date: "",
    expiry_date: "",
  });

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    auto_classify: true,
    extract_metadata: true,
    create_workflow: false,
    workflow_type: "review_approval",
  });

  useEffect(() => {
    loadDocuments();
    loadWorkflows();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await governanceRegulationsAPI.documents.getAll();
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      // Load mock data for demonstration
      setDocuments([
        {
          id: "doc-001",
          title: "Patient Safety Policy - Version 3.2",
          type: "policy",
          category: "patient_safety",
          version: "3.2",
          status: "active",
          content:
            "Comprehensive patient safety policy covering all aspects of patient care and safety protocols.",
          summary:
            "Updated patient safety policy with enhanced protocols for medication administration and fall prevention.",
          tags: ["patient_safety", "medication", "falls", "protocols"],
          author: "Dr. Sarah Ahmed",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T14:30:00Z",
          effective_date: "2024-02-01",
          expiry_date: "2025-02-01",
          approval_workflow: {
            status: "approved",
            approvers: [
              {
                name: "Dr. Ahmed Al Rashid",
                role: "Medical Director",
                status: "approved",
                date: "2024-01-18",
              },
              {
                name: "Layla Al Zahra",
                role: "Quality Manager",
                status: "approved",
                date: "2024-01-19",
              },
            ],
          },
          compliance_requirements: [
            "DOH_Standards",
            "JAWDA_Requirements",
            "Daman_Guidelines",
          ],
          related_documents: ["doc-002", "doc-003"],
          access_level: "internal",
          download_count: 45,
          view_count: 128,
          is_favorite: true,
          metadata: {
            file_size: "2.4 MB",
            file_format: "PDF",
            language: "English",
            classification_confidence: 0.95,
          },
        },
        {
          id: "doc-002",
          title: "Infection Control Procedures",
          type: "procedure",
          category: "infection_control",
          version: "2.1",
          status: "under_review",
          content:
            "Detailed procedures for infection prevention and control in healthcare settings.",
          summary:
            "Comprehensive infection control procedures updated for COVID-19 protocols.",
          tags: ["infection_control", "covid19", "ppe", "sterilization"],
          author: "Nurse Manager Fatima",
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-22T11:15:00Z",
          effective_date: "2024-02-15",
          expiry_date: "2025-02-15",
          approval_workflow: {
            status: "pending",
            approvers: [
              {
                name: "Dr. Ahmed Al Rashid",
                role: "Medical Director",
                status: "pending",
              },
              {
                name: "Infection Control Specialist",
                role: "IC Specialist",
                status: "pending",
              },
            ],
          },
          compliance_requirements: ["WHO_Guidelines", "DOH_Standards"],
          related_documents: ["doc-001"],
          access_level: "internal",
          download_count: 23,
          view_count: 67,
          is_favorite: false,
          metadata: {
            file_size: "1.8 MB",
            file_format: "PDF",
            language: "English",
            classification_confidence: 0.92,
          },
        },
        {
          id: "doc-003",
          title: "Emergency Response Guidelines",
          type: "guideline",
          category: "emergency_management",
          version: "1.5",
          status: "draft",
          content:
            "Guidelines for emergency response procedures and protocols.",
          summary:
            "Updated emergency response guidelines with new evacuation procedures.",
          tags: ["emergency", "evacuation", "response", "protocols"],
          author: "Emergency Coordinator",
          created_at: "2024-01-25T16:00:00Z",
          updated_at: "2024-01-25T16:00:00Z",
          effective_date: "2024-03-01",
          expiry_date: "2025-03-01",
          approval_workflow: {
            status: "draft",
            approvers: [
              {
                name: "Safety Officer",
                role: "Safety Officer",
                status: "pending",
              },
              {
                name: "Facility Manager",
                role: "Facility Manager",
                status: "pending",
              },
            ],
          },
          compliance_requirements: ["Fire_Safety_Code", "Building_Regulations"],
          related_documents: [],
          access_level: "restricted",
          download_count: 5,
          view_count: 12,
          is_favorite: false,
          metadata: {
            file_size: "3.1 MB",
            file_format: "DOCX",
            language: "English",
            classification_confidence: 0.88,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await governanceRegulationsAPI.workflows.getAll();
      setWorkflows(response.data || []);
    } catch (error) {
      console.error("Error loading workflows:", error);
      // Load mock workflow data
      setWorkflows([
        {
          id: "wf-001",
          document_id: "doc-002",
          workflow_type: "review_approval",
          status: "in_progress",
          steps: [
            {
              step_name: "Initial Review",
              assignee: "Quality Reviewer",
              status: "completed",
              due_date: "2024-01-23",
              completed_date: "2024-01-22",
              comments: "Document reviewed and approved for next stage",
            },
            {
              step_name: "Medical Director Approval",
              assignee: "Dr. Ahmed Al Rashid",
              status: "in_progress",
              due_date: "2024-01-25",
            },
            {
              step_name: "Final Publication",
              assignee: "Document Controller",
              status: "pending",
              due_date: "2024-01-26",
            },
          ],
          created_at: "2024-01-20T10:00:00Z",
          updated_at: "2024-01-22T15:30:00Z",
        },
      ]);
    }
  };

  const createDocument = async () => {
    try {
      await governanceRegulationsAPI.documents.create({
        ...documentForm,
        version: "1.0",
        status: "draft",
        author: "Current User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setShowDocumentDialog(false);
      resetDocumentForm();
      loadDocuments();
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  const uploadDocuments = async () => {
    try {
      const formData = new FormData();
      uploadForm.files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("auto_classify", uploadForm.auto_classify.toString());
      formData.append(
        "extract_metadata",
        uploadForm.extract_metadata.toString(),
      );
      formData.append("create_workflow", uploadForm.create_workflow.toString());
      formData.append("workflow_type", uploadForm.workflow_type);

      await governanceRegulationsAPI.documents.upload(formData);
      setShowUploadDialog(false);
      resetUploadForm();
      loadDocuments();
    } catch (error) {
      console.error("Error uploading documents:", error);
    }
  };

  const toggleFavorite = async (documentId: string) => {
    try {
      await governanceRegulationsAPI.documents.toggleFavorite(documentId);
      loadDocuments();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const archiveDocument = async (documentId: string) => {
    try {
      await governanceRegulationsAPI.documents.archive(documentId);
      loadDocuments();
    } catch (error) {
      console.error("Error archiving document:", error);
    }
  };

  const resetDocumentForm = () => {
    setDocumentForm({
      title: "",
      type: "policy",
      category: "governance",
      content: "",
      summary: "",
      tags: [],
      compliance_requirements: [],
      access_level: "internal",
      effective_date: "",
      expiry_date: "",
    });
  };

  const resetUploadForm = () => {
    setUploadForm({
      files: [],
      auto_classify: true,
      extract_metadata: true,
      create_workflow: false,
      workflow_type: "review_approval",
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const aValue = a[sortBy as keyof Document];
    const bValue = b[sortBy as keyof Document];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "archived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "public":
        return <Unlock className="h-4 w-4 text-green-600" />;
      case "internal":
        return <Lock className="h-4 w-4 text-blue-600" />;
      case "restricted":
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Lock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="h-6 w-6 mr-3 text-blue-600" />
              Document Management System
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive governance document lifecycle management with
              AI-powered classification
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog
              open={showDocumentDialog}
              onOpenChange={setShowDocumentDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Documents
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter((doc) => doc.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    documents.filter((doc) => doc.status === "under_review")
                      .length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    documents.filter((doc) => {
                      const expiryDate = new Date(doc.expiry_date);
                      const thirtyDaysFromNow = new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000,
                      );
                      return expiryDate <= thirtyDaysFromNow;
                    }).length
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-purple-600">
                  {documents.filter((doc) => doc.is_favorite).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents, tags, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="policy">Policies</SelectItem>
              <SelectItem value="procedure">Procedures</SelectItem>
              <SelectItem value="guideline">Guidelines</SelectItem>
              <SelectItem value="form">Forms</SelectItem>
              <SelectItem value="regulation">Regulations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="view_count">Most Viewed</SelectItem>
              <SelectItem value="download_count">Most Downloaded</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="grid gap-6">
            {sortedDocuments.map((document) => (
              <Card
                key={document.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">
                          {document.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(document.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${document.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                          />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          {document.type.replace("_", " ")} • Version{" "}
                          {document.version}
                        </span>
                        <span>By {document.author}</span>
                        <span>{formatDate(document.updated_at)}</span>
                        <div className="flex items-center space-x-1">
                          {getAccessLevelIcon(document.access_level)}
                          <span className="capitalize">
                            {document.access_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(document.status)}>
                        {document.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {document.category.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Summary
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {document.summary}
                      </p>
                    </div>

                    {document.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Tags
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {document.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Effective Date
                        </Label>
                        <p className="text-gray-900">
                          {formatDate(document.effective_date)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Expiry Date
                        </Label>
                        <p className="text-gray-900">
                          {formatDate(document.expiry_date)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Views
                        </Label>
                        <p className="text-gray-900">{document.view_count}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Downloads
                        </Label>
                        <p className="text-gray-900">
                          {document.download_count}
                        </p>
                      </div>
                    </div>

                    {document.compliance_requirements.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Compliance Requirements
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {document.compliance_requirements.map((req) => (
                            <Badge
                              key={req}
                              variant="outline"
                              className="text-xs"
                            >
                              <FileCheck className="h-3 w-3 mr-1" />
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>
                          Approval: {document.approval_workflow.status}
                        </span>
                        {document.metadata.classification_confidence && (
                          <span>
                            • AI Confidence:{" "}
                            {Math.round(
                              document.metadata.classification_confidence * 100,
                            )}
                            %
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveDocument(document.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Workflow className="h-5 w-5 mr-2 text-blue-600" />
                        {workflow.workflow_type.replace("_", " ").toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Document:{" "}
                        {documents.find((d) => d.id === workflow.document_id)
                          ?.title || workflow.document_id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 border rounded-lg"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : step.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.step_name}</h4>
                              <Badge
                                variant="outline"
                                className={getStatusColor(step.status)}
                              >
                                {step.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Assigned to: {step.assignee}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: {formatDate(step.due_date)}
                            </p>
                            {step.completed_date && (
                              <p className="text-sm text-green-600">
                                Completed: {formatDate(step.completed_date)}
                              </p>
                            )}
                            {step.comments && (
                              <p className="text-sm text-gray-700 mt-1 italic">
                                "{step.comments}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-600">
                      <span>Created: {formatDate(workflow.created_at)}</span>
                      <span>
                        Last Updated: {formatDate(workflow.updated_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "policy",
                    "procedure",
                    "guideline",
                    "form",
                    "regulation",
                  ].map((type) => {
                    const count = documents.filter(
                      (doc) => doc.type === type,
                    ).length;
                    const percentage =
                      documents.length > 0
                        ? (count / documents.length) * 100
                        : 0;
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium capitalize">
                          {type.replace("_", " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "active",
                    "draft",
                    "under_review",
                    "approved",
                    "expired",
                  ].map((status) => {
                    const count = documents.filter(
                      (doc) => doc.status === status,
                    ).length;
                    const percentage =
                      documents.length > 0
                        ? (count / documents.length) * 100
                        : 0;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .sort((a, b) => b.view_count - a.view_count)
                    .slice(0, 5)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-gray-600">{doc.type}</p>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {doc.view_count} views
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "DOH_Standards",
                    "JAWDA_Requirements",
                    "Daman_Guidelines",
                    "WHO_Guidelines",
                    "Fire_Safety_Code",
                  ].map((req) => {
                    const count = documents.filter((doc) =>
                      doc.compliance_requirements.includes(req),
                    ).length;
                    const percentage =
                      documents.length > 0
                        ? (count / documents.length) * 100
                        : 0;
                    return (
                      <div key={req} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {req.replace("_", " ")}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} documents
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Expiry Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .filter((doc) => doc.expiry_date)
                    .sort(
                      (a, b) =>
                        new Date(a.expiry_date).getTime() -
                        new Date(b.expiry_date).getTime(),
                    )
                    .slice(0, 5)
                    .map((doc) => {
                      const expiryDate = new Date(doc.expiry_date);
                      const daysUntilExpiry = Math.ceil(
                        (expiryDate.getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      );
                      const isExpiringSoon = daysUntilExpiry <= 30;
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatDate(doc.expiry_date)}
                            </p>
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              isExpiringSoon ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {daysUntilExpiry > 0
                              ? `${daysUntilExpiry} days`
                              : "Expired"}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Document Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={documentForm.title}
                  onChange={(e) =>
                    setDocumentForm({ ...documentForm, title: e.target.value })
                  }
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <Label htmlFor="type">Document Type</Label>
                <Select
                  value={documentForm.type}
                  onValueChange={(value) =>
                    setDocumentForm({ ...documentForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={documentForm.category}
                  onValueChange={(value) =>
                    setDocumentForm({ ...documentForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="patient_safety">
                      Patient Safety
                    </SelectItem>
                    <SelectItem value="infection_control">
                      Infection Control
                    </SelectItem>
                    <SelectItem value="emergency_management">
                      Emergency Management
                    </SelectItem>
                    <SelectItem value="quality_assurance">
                      Quality Assurance
                    </SelectItem>
                    <SelectItem value="regulatory_compliance">
                      Regulatory Compliance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="access_level">Access Level</Label>
                <Select
                  value={documentForm.access_level}
                  onValueChange={(value) =>
                    setDocumentForm({ ...documentForm, access_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Document Summary</Label>
              <Textarea
                id="summary"
                value={documentForm.summary}
                onChange={(e) =>
                  setDocumentForm({ ...documentForm, summary: e.target.value })
                }
                placeholder="Brief summary of the document"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                value={documentForm.content}
                onChange={(e) =>
                  setDocumentForm({ ...documentForm, content: e.target.value })
                }
                placeholder="Full document content"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={documentForm.effective_date}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      effective_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={documentForm.expiry_date}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      expiry_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDocumentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createDocument}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Documents Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Document Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="files">Select Files</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadForm({ ...uploadForm, files });
                }}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_classify"
                  checked={uploadForm.auto_classify}
                  onCheckedChange={(checked) =>
                    setUploadForm({ ...uploadForm, auto_classify: checked })
                  }
                />
                <Label htmlFor="auto_classify">
                  Auto-classify documents using AI
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="extract_metadata"
                  checked={uploadForm.extract_metadata}
                  onCheckedChange={(checked) =>
                    setUploadForm({ ...uploadForm, extract_metadata: checked })
                  }
                />
                <Label htmlFor="extract_metadata">
                  Extract metadata automatically
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create_workflow"
                  checked={uploadForm.create_workflow}
                  onCheckedChange={(checked) =>
                    setUploadForm({ ...uploadForm, create_workflow: checked })
                  }
                />
                <Label htmlFor="create_workflow">
                  Create approval workflow
                </Label>
              </div>
            </div>

            {uploadForm.create_workflow && (
              <div>
                <Label htmlFor="workflow_type">Workflow Type</Label>
                <Select
                  value={uploadForm.workflow_type}
                  onValueChange={(value) =>
                    setUploadForm({ ...uploadForm, workflow_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review_approval">
                      Review & Approval
                    </SelectItem>
                    <SelectItem value="compliance_check">
                      Compliance Check
                    </SelectItem>
                    <SelectItem value="quality_review">
                      Quality Review
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {uploadForm.files.length > 0 && (
              <div>
                <Label>Selected Files ({uploadForm.files.length})</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {uploadForm.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadDocuments}
              className="bg-green-600 hover:bg-green-700"
              disabled={uploadForm.files.length === 0}
            >
              Upload Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;
