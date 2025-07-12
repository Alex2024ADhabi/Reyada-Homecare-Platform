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
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  FileText,
  Tag,
  Zap,
  Eye,
  Edit,
  RefreshCw,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Layers,
  Sparkles,
  Database,
  BookOpen,
  Shield,
  Users,
  Calendar,
  Activity,
} from "lucide-react";
import { governanceRegulationsAPI } from "@/api/governance-regulations.api";

interface ClassificationResult {
  id: string;
  documentId: string;
  documentTitle: string;
  suggestedType: string;
  suggestedCategory: string;
  suggestedTags: string[];
  confidenceScore: number;
  aiModel: string;
  classificationDate: string;
  status: "pending" | "approved" | "rejected" | "manual_review";
  reviewedBy?: string;
  reviewedAt?: string;
  originalClassification?: {
    type: string;
    category: string;
    tags: string[];
  };
  metadata: {
    contentLength: number;
    language: string;
    keyPhrases: string[];
    entities: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
    sentiment: {
      score: number;
      label: string;
    };
  };
}

interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    weight: number;
  }>;
  actions: {
    type: string;
    category: string;
    tags: string[];
    confidence: number;
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassificationModel {
  id: string;
  name: string;
  version: string;
  type: "rule_based" | "ml_model" | "hybrid";
  accuracy: number;
  trainingDate: string;
  isActive: boolean;
  supportedLanguages: string[];
  categories: string[];
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

const DocumentClassification: React.FC = () => {
  const [activeTab, setActiveTab] = useState("results");
  const [classificationResults, setClassificationResults] = useState<ClassificationResult[]>([]);
  const [classificationRules, setClassificationRules] = useState<ClassificationRule[]>([]);
  const [classificationModels, setClassificationModels] = useState<ClassificationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterConfidence, setFilterConfidence] = useState("all");
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null);
  const [autoClassification, setAutoClassification] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);

  // Rule Form State
  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    conditions: [{ field: "content", operator: "contains", value: "", weight: 1.0 }],
    actions: {
      type: "policy",
      category: "governance",
      tags: [] as string[],
      confidence: 0.9,
    },
    priority: 1,
  });

  useEffect(() => {
    loadClassificationData();
  }, []);

  const loadClassificationData = async () => {
    try {
      setIsLoading(true);
      // Load classification results, rules, and models
      const [resultsResponse, rulesResponse, modelsResponse] = await Promise.all([
        governanceRegulationsAPI.classification.getResults(),
        governanceRegulationsAPI.classification.getRules(),
        governanceRegulationsAPI.classification.getModels(),
      ]);
      
      setClassificationResults(resultsResponse.data || []);
      setClassificationRules(rulesResponse.data || []);
      setClassificationModels(modelsResponse.data || []);
    } catch (error) {
      console.error("Error loading classification data:", error);
      // Load mock data for demonstration
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockResults: ClassificationResult[] = [
      {
        id: "cr-001",
        documentId: "doc-001",
        documentTitle: "Patient Safety Policy - Version 3.2",
        suggestedType: "policy",
        suggestedCategory: "patient_safety",
        suggestedTags: ["patient_safety", "medication", "falls", "protocols"],
        confidenceScore: 0.95,
        aiModel: "healthcare-classifier-v2.1",
        classificationDate: "2024-01-20T14:30:00Z",
        status: "approved",
        reviewedBy: "Dr. Sarah Ahmed",
        reviewedAt: "2024-01-20T15:00:00Z",
        originalClassification: {
          type: "guideline",
          category: "general",
          tags: ["safety"],
        },
        metadata: {
          contentLength: 2450,
          language: "en",
          keyPhrases: ["patient safety", "medication administration", "fall prevention", "risk assessment"],
          entities: [
            { text: "DOH", type: "ORGANIZATION", confidence: 0.98 },
            { text: "JAWDA", type: "ORGANIZATION", confidence: 0.96 },
            { text: "medication", type: "MEDICAL_TERM", confidence: 0.94 },
          ],
          sentiment: { score: 0.1, label: "neutral" },
        },
      },
      {
        id: "cr-002",
        documentId: "doc-002",
        documentTitle: "Infection Control Procedures",
        suggestedType: "procedure",
        suggestedCategory: "infection_control",
        suggestedTags: ["infection_control", "covid19", "ppe", "sterilization"],
        confidenceScore: 0.88,
        aiModel: "healthcare-classifier-v2.1",
        classificationDate: "2024-01-22T11:15:00Z",
        status: "pending",
        metadata: {
          contentLength: 1850,
          language: "en",
          keyPhrases: ["infection control", "personal protective equipment", "sterilization", "COVID-19"],
          entities: [
            { text: "WHO", type: "ORGANIZATION", confidence: 0.97 },
            { text: "PPE", type: "MEDICAL_TERM", confidence: 0.95 },
            { text: "sterilization", type: "MEDICAL_PROCEDURE", confidence: 0.92 },
          ],
          sentiment: { score: -0.2, label: "slightly_negative" },
        },
      },
      {
        id: "cr-003",
        documentId: "doc-003",
        documentTitle: "Emergency Response Guidelines",
        suggestedType: "guideline",
        suggestedCategory: "emergency_management",
        suggestedTags: ["emergency", "evacuation", "response", "protocols"],
        confidenceScore: 0.72,
        aiModel: "healthcare-classifier-v2.1",
        classificationDate: "2024-01-25T16:00:00Z",
        status: "manual_review",
        metadata: {
          contentLength: 3100,
          language: "en",
          keyPhrases: ["emergency response", "evacuation procedures", "crisis management", "safety protocols"],
          entities: [
            { text: "Fire Safety Code", type: "REGULATION", confidence: 0.89 },
            { text: "evacuation", type: "PROCEDURE", confidence: 0.91 },
            { text: "emergency", type: "EVENT_TYPE", confidence: 0.93 },
          ],
          sentiment: { score: -0.1, label: "neutral" },
        },
      },
    ];

    const mockRules: ClassificationRule[] = [
      {
        id: "rule-001",
        name: "Patient Safety Policy Detection",
        description: "Automatically classify documents containing patient safety keywords",
        conditions: [
          { field: "content", operator: "contains", value: "patient safety", weight: 0.8 },
          { field: "content", operator: "contains", value: "medication", weight: 0.6 },
          { field: "title", operator: "contains", value: "safety", weight: 0.7 },
        ],
        actions: {
          type: "policy",
          category: "patient_safety",
          tags: ["patient_safety", "medication", "protocols"],
          confidence: 0.85,
        },
        isActive: true,
        priority: 1,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T14:30:00Z",
      },
      {
        id: "rule-002",
        name: "Infection Control Classification",
        description: "Classify infection control and prevention documents",
        conditions: [
          { field: "content", operator: "contains", value: "infection control", weight: 0.9 },
          { field: "content", operator: "contains", value: "PPE", weight: 0.5 },
          { field: "content", operator: "contains", value: "sterilization", weight: 0.6 },
        ],
        actions: {
          type: "procedure",
          category: "infection_control",
          tags: ["infection_control", "ppe", "sterilization"],
          confidence: 0.82,
        },
        isActive: true,
        priority: 2,
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-22T11:15:00Z",
      },
    ];

    const mockModels: ClassificationModel[] = [
      {
        id: "model-001",
        name: "Healthcare Document Classifier",
        version: "v2.1",
        type: "ml_model",
        accuracy: 0.94,
        trainingDate: "2024-01-01T00:00:00Z",
        isActive: true,
        supportedLanguages: ["en", "ar"],
        categories: ["policy", "procedure", "guideline", "form", "regulation"],
        performance: {
          precision: 0.93,
          recall: 0.91,
          f1Score: 0.92,
        },
      },
      {
        id: "model-002",
        name: "Rule-Based Classifier",
        version: "v1.5",
        type: "rule_based",
        accuracy: 0.87,
        trainingDate: "2024-01-15T00:00:00Z",
        isActive: true,
        supportedLanguages: ["en"],
        categories: ["policy", "procedure", "guideline"],
        performance: {
          precision: 0.89,
          recall: 0.85,
          f1Score: 0.87,
        },
      },
    ];

    setClassificationResults(mockResults);
    setClassificationRules(mockRules);
    setClassificationModels(mockModels);
  };

  const approveClassification = async (resultId: string) => {
    try {
      await governanceRegulationsAPI.classification.approve(resultId);
      loadClassificationData();
    } catch (error) {
      console.error("Error approving classification:", error);
    }
  };

  const rejectClassification = async (resultId: string) => {
    try {
      await governanceRegulationsAPI.classification.reject(resultId);
      loadClassificationData();
    } catch (error) {
      console.error("Error rejecting classification:", error);
    }
  };

  const createRule = async () => {
    try {
      await governanceRegulationsAPI.classification.createRule({
        ...ruleForm,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowRuleDialog(false);
      resetRuleForm();
      loadClassificationData();
    } catch (error) {
      console.error("Error creating rule:", error);
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: "",
      description: "",
      conditions: [{ field: "content", operator: "contains", value: "", weight: 1.0 }],
      actions: {
        type: "policy",
        category: "governance",
        tags: [],
        confidence: 0.9,
      },
      priority: 1,
    });
  };

  const addCondition = () => {
    setRuleForm({
      ...ruleForm,
      conditions: [
        ...ruleForm.conditions,
        { field: "content", operator: "contains", value: "", weight: 1.0 },
      ],
    });
  };

  const removeCondition = (index: number) => {
    setRuleForm({
      ...ruleForm,
      conditions: ruleForm.conditions.filter((_, i) => i !== index),
    });
  };

  const filteredResults = classificationResults.filter((result) => {
    const matchesSearch =
      result.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.suggestedTags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus = filterStatus === "all" || result.status === filterStatus;
    const matchesConfidence =
      filterConfidence === "all" ||
      (filterConfidence === "high" && result.confidenceScore >= 0.8) ||
      (filterConfidence === "medium" && result.confidenceScore >= 0.6 && result.confidenceScore < 0.8) ||
      (filterConfidence === "low" && result.confidenceScore < 0.6);
    return matchesSearch && matchesStatus && matchesConfidence;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "manual_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI classification system...</p>
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
              <Brain className="h-6 w-6 mr-3 text-purple-600" />
              AI Document Classification System
            </h1>
            <p className="text-gray-600 mt-1">
              Intelligent document classification with machine learning and rule-based approaches
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
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
                <p className="text-sm font-medium text-gray-600">Total Classifications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classificationResults.length}
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {classificationResults.filter((r) => r.status === "approved").length}
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
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {classificationResults.filter((r) => r.status === "pending").length}
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
                <p className="text-sm font-medium text-gray-600">High Confidence</p>
                <p className="text-2xl font-bold text-purple-600">
                  {classificationResults.filter((r) => r.confidenceScore >= 0.8).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {classificationRules.filter((r) => r.isActive).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search classifications, documents, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="manual_review">Manual Review</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterConfidence} onValueChange={setFilterConfidence}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High (≥80%)</SelectItem>
              <SelectItem value="medium">Medium (60-79%)</SelectItem>
              <SelectItem value="low">Low (<60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Classification Results</TabsTrigger>
          <TabsTrigger value="rules">Classification Rules</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Classification Results Tab */}
        <TabsContent value="results">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{result.documentTitle}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span>Model: {result.aiModel}</span>
                        <span>{formatDate(result.classificationDate)}</span>
                        <span className={`font-medium ${getConfidenceColor(result.confidenceScore)}`}>
                          Confidence: {Math.round(result.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Suggested Type</Label>
                        <Badge variant="outline" className="mt-1">
                          <FileText className="h-3 w-3 mr-1" />
                          {result.suggestedType}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <Badge variant="outline" className="mt-1">
                          <Layers className="h-3 w-3 mr-1" />
                          {result.suggestedCategory.replace("_", " ")}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Confidence Score</Label>
                        <div className="mt-1">
                          <Progress value={result.confidenceScore * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {result.suggestedTags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Suggested Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.suggestedTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.metadata.keyPhrases.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Key Phrases</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.metadata.keyPhrases.slice(0, 5).map((phrase) => (
                            <Badge key={phrase} variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.metadata.entities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Detected Entities</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.metadata.entities.slice(0, 3).map((entity) => (
                            <Badge key={entity.text} variant="outline" className="text-xs">
                              {entity.text} ({entity.type})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-gray-600">
                        {result.reviewedBy && (
                          <span>Reviewed by {result.reviewedBy} on {formatDate(result.reviewedAt!)}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {result.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveClassification(result.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rejectClassification(result.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Classification Rules Tab */}
        <TabsContent value="rules">
          <div className="space-y-4">
            {classificationRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-indigo-600" />
                        {rule.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Priority {rule.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Conditions</Label>
                      <div className="mt-2 space-y-2">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Badge variant="outline">{condition.field}</Badge>
                            <span className="text-gray-500">{condition.operator}</span>
                            <Badge variant="secondary">"{condition.value}"</Badge>
                            <span className="text-gray-500">weight: {condition.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Actions</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="outline">
                          Type: {rule.actions.type}
                        </Badge>
                        <Badge variant="outline">
                          Category: {rule.actions.category.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          Confidence: {Math.round(rule.actions.confidence * 100)}%
                        </Badge>
                      </div>
                      {rule.actions.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rule.actions.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-600">
                      <span>Created: {formatDate(rule.createdAt)}</span>
                      <span>Updated: {formatDate(rule.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="models">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classificationModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        {model.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Version {model.version} • {model.type.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant={model.isActive ? "default" : "secondary"}>
                      {model.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Overall Accuracy</Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Progress value={model.accuracy * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(model.accuracy * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Precision</Label>
                        <p className="text-lg font-semibold text-blue-600">
                          {Math.round(model.performance.precision * 100)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Recall</Label>
                        <p className="text-lg font-semibold text-green-600">
                          {Math.round(model.performance.recall * 100)}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">F1 Score</Label>
                        <p className="text-lg font-semibold text-purple-600">
                          {Math.round(model.performance.f1Score * 100)}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Supported Categories</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Languages</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.supportedLanguages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 pt-2 border-t">
                      Trained: {formatDate(model.trainingDate)}
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
                <CardTitle>Classification Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["approved", "pending", "rejected", "manual_review"].map((status) => {
                    const count = classificationResults.filter((r) => r.status === status).length;
                    const percentage = classificationResults.length > 0 ? (count / classificationResults.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "High (≥80%)", min: 0.8, max: 1.0, color: "bg-green-600" },
                    { label: "Medium (60-79%)", min: 0.6, max: 0.8, color: "bg-yellow-600" },
                    { label: "Low (<60%)", min: 0.0, max: 0.6, color: "bg-red-600" },
                  ].map((range) => {
                    const count = classificationResults.filter(
                      (r) => r.confidenceScore >= range.min && r.confidenceScore < range.max
                    ).length;
                    const percentage = classificationResults.length > 0 ? (count / classificationResults.length) * 100 : 0;
                    return (
                      <div key={range.label} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{range.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${range.color} h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classificationModels.map((model) => (
                    <div key={model.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(model.accuracy * 100)}%
                        </span>
                      </div>
                      <Progress value={model.accuracy * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Classification Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={ruleForm.priority.toString()}
                  onValueChange={(value) => setRuleForm({ ...ruleForm, priority: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Medium (2)</SelectItem>
                    <SelectItem value="3">Low (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={ruleForm.description}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                placeholder="Describe what this rule does"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-2">
                {ruleForm.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={condition.field}
                      onValueChange={(value) => {
                        const newConditions = [...ruleForm.conditions];
                        newConditions[index].field = value;
                        setRuleForm({ ...ruleForm, conditions: newConditions });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="filename">Filename</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => {
                        const newConditions = [...ruleForm.conditions];
                        newConditions[index].operator = value;
                        setRuleForm({ ...ruleForm, conditions: newConditions });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                        <SelectItem value="ends_with">Ends With</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={condition.value}
                      onChange={(e) => {
                        const newConditions = [...ruleForm.conditions];
                        newConditions[index].value = e.target.value;
                        setRuleForm({ ...ruleForm, conditions: newConditions });
                      }}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={condition.weight}
                      onChange={(e) => {
                        const newConditions = [...ruleForm.conditions];
                        newConditions[index].weight = parseFloat(e.target.value);
                        setRuleForm({ ...ruleForm, conditions: newConditions });
                      }}
                      placeholder="Weight"
                      className="w-20"
                    />
                    {ruleForm.conditions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actionType">Classification Type</Label>
                <Select
                  value={ruleForm.actions.type}
                  onValueChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      actions: { ...ruleForm.actions, type: value },
                    })
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
              <div>
                <Label htmlFor="actionCategory">Category</Label>
                <Select
                  value={ruleForm.actions.category}
                  onValueChange={(value) =>
                    setRuleForm({
                      ...ruleForm,
                      actions: { ...ruleForm.actions, category: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="patient_safety">Patient Safety</SelectItem>
                    <SelectItem value="infection_control">Infection Control</SelectItem>
                    <SelectItem value="emergency_management">Emergency Management</SelectItem>
                    <SelectItem value="quality_assurance">Quality Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="confidence">Confidence Score</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={ruleForm.actions.confidence}
                  onChange={(e) =>
                    setRuleForm({
                      ...ruleForm,
                      actions: { ...ruleForm.actions, confidence: parseFloat(e.target.value) },
                    })
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-600">
                  {Math.round(ruleForm.actions.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createRule} className="bg-purple-600 hover:bg-purple-700">
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentClassification;