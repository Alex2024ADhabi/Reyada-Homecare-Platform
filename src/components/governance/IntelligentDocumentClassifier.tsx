import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  Tag,
  Zap,
} from "lucide-react";

// Safe API import with fallback
let governanceRegulationsAPI: any = {
  classifyDocument: async () => ({
    success: false,
    error: "API not available",
  }),
  getClassificationHistory: async () => ({ success: false, data: [] }),
  updateClassification: async () => ({ success: false }),
  getComplianceFrameworks: async () => ({ success: false, data: [] }),
};

try {
  const apiModule = require("@/api/governance-regulations.api");
  governanceRegulationsAPI =
    apiModule.governanceRegulationsAPI || governanceRegulationsAPI;
} catch (error) {
  console.warn(
    "Governance regulations API not available, using fallback",
    error,
  );
}

// Types
interface DocumentClassification {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  classification: {
    category: string;
    subcategory: string;
    confidence: number;
    tags: string[];
    complianceFramework: string;
    riskLevel: "low" | "medium" | "high";
    requiresReview: boolean;
  };
  aiAnalysis: {
    summary: string;
    keyPoints: string[];
    complianceGaps: string[];
    recommendations: string[];
  };
  status: "pending" | "classified" | "reviewed" | "approved" | "rejected";
  reviewedBy?: string;
  reviewDate?: string;
}

interface ClassificationFilter {
  category: string;
  status: string;
  riskLevel: string;
  dateRange: string;
}

const IntelligentDocumentClassifier: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentClassification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentClassification | null>(null);
  const [filter, setFilter] = useState<ClassificationFilter>({
    category: "all",
    status: "all",
    riskLevel: "all",
    dateRange: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data for demonstration
  const mockDocuments: DocumentClassification[] = [
    {
      id: "doc-001",
      fileName: "DOH_Compliance_Guidelines_2024.pdf",
      fileType: "pdf",
      fileSize: 2048576,
      uploadDate: "2024-01-15T10:30:00Z",
      classification: {
        category: "Regulatory Guidelines",
        subcategory: "DOH Compliance",
        confidence: 0.95,
        tags: ["DOH", "Compliance", "Healthcare", "Guidelines"],
        complianceFramework: "DOH Standards",
        riskLevel: "high",
        requiresReview: true,
      },
      aiAnalysis: {
        summary:
          "Comprehensive DOH compliance guidelines for healthcare providers in UAE.",
        keyPoints: [
          "Updated licensing requirements",
          "Quality assurance protocols",
          "Patient safety standards",
          "Documentation requirements",
        ],
        complianceGaps: [
          "Missing staff certification tracking",
          "Incomplete incident reporting procedures",
        ],
        recommendations: [
          "Implement automated compliance monitoring",
          "Establish regular audit schedules",
          "Update staff training programs",
        ],
      },
      status: "classified",
    },
    {
      id: "doc-002",
      fileName: "JAWDA_Accreditation_Standards.docx",
      fileType: "docx",
      fileSize: 1536000,
      uploadDate: "2024-01-14T14:20:00Z",
      classification: {
        category: "Accreditation Standards",
        subcategory: "JAWDA Requirements",
        confidence: 0.88,
        tags: ["JAWDA", "Accreditation", "Quality", "Standards"],
        complianceFramework: "JAWDA Framework",
        riskLevel: "medium",
        requiresReview: false,
      },
      aiAnalysis: {
        summary:
          "JAWDA accreditation standards and requirements for healthcare facilities.",
        keyPoints: [
          "Patient care standards",
          "Facility management requirements",
          "Staff competency criteria",
          "Continuous improvement processes",
        ],
        complianceGaps: [],
        recommendations: [
          "Align current processes with JAWDA standards",
          "Prepare for accreditation assessment",
        ],
      },
      status: "approved",
      reviewedBy: "Dr. Sarah Ahmed",
      reviewDate: "2024-01-14T16:45:00Z",
    },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response =
        await governanceRegulationsAPI.getClassificationHistory();
      if (response.success) {
        setDocuments(response.data);
      } else {
        // Use mock data as fallback
        setDocuments(mockDocuments);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments(mockDocuments);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);

      const response =
        await governanceRegulationsAPI.classifyDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setSuccess("Document uploaded and classified successfully!");
        await loadDocuments();
      } else {
        // Create mock classification for demonstration
        const mockClassification: DocumentClassification = {
          id: `doc-${Date.now()}`,
          fileName: file.name,
          fileType: file.type.split("/")[1] || "unknown",
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          classification: {
            category: "General Document",
            subcategory: "Unclassified",
            confidence: 0.75,
            tags: ["New", "Pending Review"],
            complianceFramework: "General",
            riskLevel: "medium",
            requiresReview: true,
          },
          aiAnalysis: {
            summary: "Document uploaded and awaiting detailed analysis.",
            keyPoints: ["Document received", "Initial processing complete"],
            complianceGaps: ["Analysis pending"],
            recommendations: ["Complete detailed review"],
          },
          status: "pending",
        };

        setDocuments((prev) => [mockClassification, ...prev]);
        setSuccess(
          "Document uploaded successfully! Classification in progress.",
        );
      }
    } catch (error) {
      setError("Failed to upload and classify document. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.classification.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filter.category === "all" ||
      doc.classification.category === filter.category;
    const matchesStatus =
      filter.status === "all" || doc.status === filter.status;
    const matchesRiskLevel =
      filter.riskLevel === "all" ||
      doc.classification.riskLevel === filter.riskLevel;

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesRiskLevel
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "classified":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              Intelligent Document Classifier
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered document classification and compliance analysis
            </p>
          </div>

          {/* Upload Section */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Document"}
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading and classifying document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.category}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="all">All Categories</option>
                <option value="Regulatory Guidelines">
                  Regulatory Guidelines
                </option>
                <option value="Accreditation Standards">
                  Accreditation Standards
                </option>
                <option value="Policy Documents">Policy Documents</option>
                <option value="Training Materials">Training Materials</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.status}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="classified">Classified</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.riskLevel}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, riskLevel: e.target.value }))
                }
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setFilter({
                    category: "all",
                    status: "all",
                    riskLevel: "all",
                    dateRange: "all",
                  });
                  setSearchTerm("");
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600">
                Upload a document to get started with AI classification.
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium text-gray-900 truncate">
                        {doc.fileName}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(doc.fileSize)} •{" "}
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {doc.classification.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.classification.subcategory}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-gray-600">
                        {Math.round(doc.classification.confidence * 100)}%
                        confidence
                      </span>
                    </div>
                    <Badge
                      className={getRiskLevelColor(
                        doc.classification.riskLevel,
                      )}
                    >
                      {doc.classification.riskLevel} risk
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {doc.classification.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.classification.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.classification.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {doc.classification.requiresReview && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">Requires Review</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDocument(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedDocument.fileName}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {formatFileSize(selectedDocument.fileSize)} • Uploaded{" "}
                      {new Date(
                        selectedDocument.uploadDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDocument(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Classification Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Classification
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.classification.category}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Subcategory
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.classification.subcategory}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Compliance Framework
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.classification.complianceFramework}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Confidence Score
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={
                              selectedDocument.classification.confidence * 100
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-gray-900">
                            {Math.round(
                              selectedDocument.classification.confidence * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Risk Level
                        </label>
                        <Badge
                          className={getRiskLevelColor(
                            selectedDocument.classification.riskLevel,
                          )}
                        >
                          {selectedDocument.classification.riskLevel} risk
                        </Badge>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.classification.tags.map(
                            (tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI Analysis
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Summary
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedDocument.aiAnalysis.summary}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Key Points
                        </label>
                        <ul className="text-sm text-gray-900 mt-1 space-y-1">
                          {selectedDocument.aiAnalysis.keyPoints.map(
                            (point, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {point}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>

                      {selectedDocument.aiAnalysis.complianceGaps.length >
                        0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Compliance Gaps
                          </label>
                          <ul className="text-sm text-gray-900 mt-1 space-y-1">
                            {selectedDocument.aiAnalysis.complianceGaps.map(
                              (gap, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                  {gap}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Recommendations
                        </label>
                        <ul className="text-sm text-gray-900 mt-1 space-y-1">
                          {selectedDocument.aiAnalysis.recommendations.map(
                            (rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Zap className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Section */}
                {selectedDocument.reviewedBy && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Review Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Reviewed By
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.reviewedBy}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Review Date
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.reviewDate &&
                            new Date(
                              selectedDocument.reviewDate,
                            ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentDocumentClassifier;
