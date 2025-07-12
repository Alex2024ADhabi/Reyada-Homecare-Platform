import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  Calendar,
  User,
  Shield,
  Bell,
  History,
  Bookmark,
  Share2,
  ExternalLink,
  TrendingUp,
  Activity,
} from "lucide-react";
import { governanceRegulationsAPI, Document } from "@/api/governance-regulations.api";

interface StaffUser {
  id: string;
  name: string;
  role: string;
  department: string;
  accessLevel: "basic" | "advanced" | "admin";
  favorites: string[];
  recentlyViewed: string[];
  acknowledgedDocuments: string[];
}

interface DocumentAccess {
  documentId: string;
  userId: string;
  accessedAt: string;
  action: "viewed" | "downloaded" | "acknowledged" | "shared";
  duration?: number;
}

const StaffLibraryAccess: React.FC = () => {
  const [currentUser] = useState<StaffUser>({
    id: "user-001",
    name: "Dr. Sarah Ahmed",
    role: "Senior Physician",
    department: "Clinical",
    accessLevel: "advanced",
    favorites: ["doc-001"],
    recentlyViewed: ["doc-001", "doc-002"],
    acknowledgedDocuments: ["doc-001"],
  });
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [accessHistory, setAccessHistory] = useState<DocumentAccess[]>([]);

  useEffect(() => {
    loadDocuments();
    loadAccessHistory();
    
    // Set up real-time updates for new documents
    const interval = setInterval(() => {
      loadDocuments();
    }, 30000); // Check for new documents every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchTerm, filterType, filterCategory, sortBy, activeTab]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would fetch from the API
      const mockDocuments: Document[] = [
        {
          id: "doc-001",
          title: "Patient Safety Policy - Version 3.2",
          description: "Comprehensive patient safety policy covering all aspects of patient care and safety protocols.",
          content: "Detailed patient safety policy content...",
          type: "policy",
          category: "healthcare",
          status: "published",
          version: "3.2",
          language: "en",
          tags: ["patient_safety", "medication", "falls", "protocols"],
          metadata: {
            fileSize: 2400000,
            mimeType: "application/pdf",
            checksum: "abc123",
            originalFileName: "patient-safety-policy-v3.2.pdf",
            uploadedAt: "2024-01-15T10:00:00Z",
            source: "governance_library",
            jurisdiction: "UAE",
            effectiveDate: "2024-02-01",
            expiryDate: "2025-02-01",
            reviewDate: "2024-08-01",
            approvalStatus: "approved",
            approvedBy: "Dr. Ahmed Al Rashid",
            approvedAt: "2024-01-18T14:30:00Z",
          },
          classification: {
            level: "internal",
            sensitivity: "medium",
            retentionPeriod: 7,
            accessControl: ["all_staff"],
            complianceFrameworks: ["DOH", "JAWDA", "DAMAN"],
          },
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          createdBy: "system",
          lastModifiedBy: "admin",
        },
        {
          id: "doc-002",
          title: "Infection Control Procedures",
          description: "Detailed procedures for infection prevention and control in healthcare settings.",
          content: "Comprehensive infection control procedures...",
          type: "procedure",
          category: "clinical",
          status: "published",
          version: "2.1",
          language: "en",
          tags: ["infection_control", "covid19", "ppe", "sterilization"],
          metadata: {
            fileSize: 1800000,
            mimeType: "application/pdf",
            checksum: "def456",
            originalFileName: "infection-control-procedures-v2.1.pdf",
            uploadedAt: "2024-01-10T09:00:00Z",
            source: "governance_library",
            jurisdiction: "UAE",
            effectiveDate: "2024-02-15",
            expiryDate: "2025-02-15",
            approvalStatus: "approved",
            approvedBy: "Infection Control Specialist",
            approvedAt: "2024-01-12T16:00:00Z",
          },
          classification: {
            level: "internal",
            sensitivity: "high",
            retentionPeriod: 5,
            accessControl: ["clinical_staff", "nursing_staff"],
            complianceFrameworks: ["WHO", "DOH"],
          },
          createdAt: "2024-01-10T09:00:00Z",
          updatedAt: "2024-01-22T11:15:00Z",
          createdBy: "system",
          lastModifiedBy: "admin",
        },
        {
          id: "doc-003",
          title: "Emergency Response Guidelines",
          description: "Guidelines for emergency response procedures and protocols.",
          content: "Emergency response guidelines content...",
          type: "guideline",
          category: "safety",
          status: "published",
          version: "1.5",
          language: "en",
          tags: ["emergency", "evacuation", "response", "protocols"],
          metadata: {
            fileSize: 3100000,
            mimeType: "application/pdf",
            checksum: "ghi789",
            originalFileName: "emergency-response-guidelines-v1.5.pdf",
            uploadedAt: "2024-01-25T16:00:00Z",
            source: "governance_library",
            jurisdiction: "UAE",
            effectiveDate: "2024-03-01",
            expiryDate: "2025-03-01",
            approvalStatus: "approved",
            approvedBy: "Safety Officer",
            approvedAt: "2024-01-26T10:00:00Z",
          },
          classification: {
            level: "internal",
            sensitivity: "medium",
            retentionPeriod: 5,
            accessControl: ["all_staff"],
            complianceFrameworks: ["Fire_Safety_Code", "Building_Regulations"],
          },
          createdAt: "2024-01-25T16:00:00Z",
          updatedAt: "2024-01-26T10:00:00Z",
          createdBy: "system",
          lastModifiedBy: "admin",
        },
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccessHistory = async () => {
    try {
      // Mock access history data
      const mockHistory: DocumentAccess[] = [
        {
          documentId: "doc-001",
          userId: currentUser.id,
          accessedAt: "2024-01-20T15:30:00Z",
          action: "viewed",
          duration: 300,
        },
        {
          documentId: "doc-002",
          userId: currentUser.id,
          accessedAt: "2024-01-19T10:15:00Z",
          action: "downloaded",
        },
        {
          documentId: "doc-001",
          userId: currentUser.id,
          accessedAt: "2024-01-18T14:00:00Z",
          action: "acknowledged",
        },
      ];
      
      setAccessHistory(mockHistory);
    } catch (error) {
      console.error("Error loading access history:", error);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];

    // Apply tab filter
    switch (activeTab) {
      case "favorites":
        filtered = filtered.filter(doc => currentUser.favorites.includes(doc.id));
        break;
      case "recent":
        filtered = filtered.filter(doc => currentUser.recentlyViewed.includes(doc.id));
        break;
      case "pending":
        filtered = filtered.filter(doc => !currentUser.acknowledgedDocuments.includes(doc.id));
        break;
      case "expiring":
        filtered = filtered.filter(doc => {
          if (!doc.metadata.expiryDate) return false;
          const expiryDate = new Date(doc.metadata.expiryDate);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return expiryDate <= thirtyDaysFromNow;
        });
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "updated_at":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created_at":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "expiry_date":
          if (!a.metadata.expiryDate && !b.metadata.expiryDate) return 0;
          if (!a.metadata.expiryDate) return 1;
          if (!b.metadata.expiryDate) return -1;
          return new Date(a.metadata.expiryDate).getTime() - new Date(b.metadata.expiryDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  };

  const handleDocumentAction = async (document: Document, action: "view" | "download" | "acknowledge" | "favorite") => {
    try {
      const accessRecord: DocumentAccess = {
        documentId: document.id,
        userId: currentUser.id,
        accessedAt: new Date().toISOString(),
        action: action === "favorite" ? "viewed" : action,
      };

      switch (action) {
        case "view":
          setSelectedDocument(document);
          setShowDocumentDialog(true);
          // Add to recently viewed if not already there
          if (!currentUser.recentlyViewed.includes(document.id)) {
            currentUser.recentlyViewed.unshift(document.id);
            // Keep only last 10 items
            currentUser.recentlyViewed = currentUser.recentlyViewed.slice(0, 10);
          }
          break;
        
        case "download":
          // In a real implementation, this would trigger file download
          console.log(`Downloading document: ${document.title}`);
          alert(`Downloading: ${document.title}`);
          break;
        
        case "acknowledge":
          if (!currentUser.acknowledgedDocuments.includes(document.id)) {
            currentUser.acknowledgedDocuments.push(document.id);
          }
          alert(`Document acknowledged: ${document.title}`);
          break;
        
        case "favorite":
          if (currentUser.favorites.includes(document.id)) {
            currentUser.favorites = currentUser.favorites.filter(id => id !== document.id);
          } else {
            currentUser.favorites.push(document.id);
          }
          break;
      }

      // Record access
      setAccessHistory(prev => [accessRecord, ...prev]);
      
      // Refresh filtered documents to reflect changes
      filterAndSortDocuments();
    } catch (error) {
      console.error(`Error performing ${action} on document:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "public":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "internal":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "confidential":
      case "restricted":
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance library...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
              Governance Library
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome, {currentUser.name} • {currentUser.role} • {currentUser.department} Department
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Access Level</p>
              <Badge className="bg-blue-100 text-blue-800 capitalize">
                {currentUser.accessLevel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-yellow-600">{currentUser.favorites.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents.length - currentUser.acknowledgedDocuments.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{currentUser.acknowledgedDocuments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-600">
                  {documents.filter(doc => {
                    if (!doc.metadata.expiryDate) return false;
                    const expiryDate = new Date(doc.metadata.expiryDate);
                    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return expiryDate <= thirtyDaysFromNow;
                  }).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
              <SelectItem value="regulation">Regulations</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
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
              <SelectItem value="expiry_date">Expiry Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentAction(document, "favorite")}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              currentUser.favorites.includes(document.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="capitalize">{document.type} • Version {document.version}</span>
                        <span>Updated {formatDate(document.updatedAt)}</span>
                        <div className="flex items-center space-x-1">
                          {getAccessLevelIcon(document.classification.level)}
                          <span className="capitalize">{document.classification.level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {document.category}
                      </Badge>
                      {currentUser.acknowledgedDocuments.includes(document.id) && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <p className="text-sm text-gray-900 mt-1">{document.description}</p>
                    </div>

                    {document.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {document.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Effective Date</Label>
                        <p className="text-gray-900">
                          {document.metadata.effectiveDate ? formatDate(document.metadata.effectiveDate) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                        <p className="text-gray-900">
                          {document.metadata.expiryDate ? formatDate(document.metadata.expiryDate) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">File Size</Label>
                        <p className="text-gray-900">{formatFileSize(document.metadata.fileSize)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Language</Label>
                        <p className="text-gray-900 uppercase">{document.language}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Approved by: {document.metadata.approvedBy}</span>
                        {document.metadata.approvedAt && (
                          <span>• {formatDate(document.metadata.approvedAt)}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentAction(document, "view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentAction(document, "download")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {!currentUser.acknowledgedDocuments.includes(document.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentAction(document, "acknowledge")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-700">Type</Label>
                  <p className="capitalize">{selectedDocument.type}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Version</Label>
                  <p>{selectedDocument.version}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Category</Label>
                  <p className="capitalize">{selectedDocument.category}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {selectedDocument.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-medium text-gray-700">Description</Label>
                <p className="mt-1">{selectedDocument.description}</p>
              </div>
              
              <div>
                <Label className="font-medium text-gray-700">Content Preview</Label>
                <ScrollArea className="h-64 w-full border rounded-md p-4 mt-1">
                  <p className="text-sm">{selectedDocument.content}</p>
                </ScrollArea>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Last updated: {formatDate(selectedDocument.updatedAt)}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDocumentAction(selectedDocument, "download")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className