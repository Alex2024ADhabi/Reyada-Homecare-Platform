/**
 * Governance & Regulations Library API
 * Phase 1: Core Foundation - Document Management and Basic Compliance
 */

// Import with fallback for missing config
let API_GATEWAY_CONFIG: any = {};
let SERVICE_ENDPOINTS: any = {
  governanceRegulations: "/api/governance",
  complianceEngine: "/api/compliance",
  documentClassification: "/api/classification",
  complianceMonitoring: "/api/monitoring",
  auditTrail: "/api/audit",
};

try {
  const apiConfig = require("@/config/api.config");
  API_GATEWAY_CONFIG = apiConfig.API_GATEWAY_CONFIG || {};
  SERVICE_ENDPOINTS = apiConfig.SERVICE_ENDPOINTS || SERVICE_ENDPOINTS;
} catch (error) {
  console.warn("API config not found, using defaults:", error);
}

// Core Types for Governance & Regulations Library
export interface Document {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  version: string;
  language: string;
  tags: string[];
  metadata: DocumentMetadata;
  classification: DocumentClassification;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface DocumentMetadata {
  fileSize: number;
  mimeType: string;
  checksum: string;
  originalFileName: string;
  uploadedAt: string;
  source: string;
  jurisdiction: string;
  effectiveDate?: string;
  expiryDate?: string;
  reviewDate?: string;
  approvalStatus: "pending" | "approved" | "rejected" | "under_review";
  approvedBy?: string;
  approvedAt?: string;
}

export interface DocumentClassification {
  level: "public" | "internal" | "confidential" | "restricted";
  sensitivity: "low" | "medium" | "high" | "critical";
  retentionPeriod: number; // in years
  accessControl: string[];
  complianceFrameworks: string[];
}

export type DocumentType =
  | "regulation"
  | "policy"
  | "procedure"
  | "guideline"
  | "standard"
  | "circular"
  | "directive"
  | "framework"
  | "template"
  | "form";

export type DocumentCategory =
  | "healthcare"
  | "clinical"
  | "administrative"
  | "financial"
  | "legal"
  | "technical"
  | "operational"
  | "quality"
  | "safety"
  | "compliance";

export type DocumentStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "published"
  | "archived"
  | "superseded"
  | "withdrawn";

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  framework: ComplianceFramework;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "exists"
    | "not_exists";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface ComplianceAction {
  type: "alert" | "block" | "log" | "escalate" | "auto_correct";
  parameters: Record<string, any>;
}

export type ComplianceFramework =
  | "DOH"
  | "ADHICS"
  | "JAWDA"
  | "DAMAN"
  | "MALAFFI"
  | "HIPAA"
  | "GDPR"
  | "ISO27001"
  | "SOC2"
  | "NIST";

export interface ComplianceCheck {
  id: string;
  documentId: string;
  ruleId: string;
  status: "passed" | "failed" | "warning" | "pending";
  score: number;
  details: string;
  recommendations: string[];
  checkedAt: string;
  checkedBy: string;
}

export interface SearchQuery {
  query?: string;
  filters?: {
    type?: DocumentType[];
    category?: DocumentCategory[];
    status?: DocumentStatus[];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    classification?: string[];
    framework?: ComplianceFramework[];
  };
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: {
    types: Record<DocumentType, number>;
    categories: Record<DocumentCategory, number>;
    statuses: Record<DocumentStatus, number>;
    tags: Record<string, number>;
  };
}

export interface UploadRequest {
  file: File;
  metadata: Partial<DocumentMetadata>;
  classification: DocumentClassification;
  tags?: string[];
}

export interface UploadResponse {
  documentId: string;
  status: "success" | "processing" | "failed";
  message: string;
  processingJobId?: string;
}

// API Service Class
export class GovernanceRegulationsAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = SERVICE_ENDPOINTS.governanceRegulations;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Version": "1.0.0",
    };
  }

  // Document Management Methods
  async uploadDocument(request: UploadRequest): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("metadata", JSON.stringify(request.metadata));
    formData.append("classification", JSON.stringify(request.classification));
    if (request.tags) {
      formData.append("tags", JSON.stringify(request.tags));
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": undefined, // Let browser set multipart boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return response.json();
  }

  async updateDocument(
    id: string,
    updates: Partial<Document>,
  ): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  async searchDocuments(query: SearchQuery): Promise<SearchResult> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocumentVersions(id: string): Promise<Document[]> {
    const response = await fetch(`${this.baseUrl}/${id}/versions`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch document versions: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // Compliance Methods
  async checkCompliance(
    documentId: string,
    frameworks?: ComplianceFramework[],
  ): Promise<ComplianceCheck[]> {
    const response = await fetch(
      `${SERVICE_ENDPOINTS.complianceEngine}/check`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ documentId, frameworks }),
      },
    );

    if (!response.ok) {
      throw new Error(`Compliance check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getComplianceRules(
    framework?: ComplianceFramework,
  ): Promise<ComplianceRule[]> {
    const url = framework
      ? `${SERVICE_ENDPOINTS.complianceEngine}/rules?framework=${framework}`
      : `${SERVICE_ENDPOINTS.complianceEngine}/rules`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch compliance rules: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async createComplianceRule(
    rule: Omit<ComplianceRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ComplianceRule> {
    const response = await fetch(
      `${SERVICE_ENDPOINTS.complianceEngine}/rules`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(rule),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create compliance rule: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async updateComplianceRule(
    id: string,
    updates: Partial<ComplianceRule>,
  ): Promise<ComplianceRule> {
    const response = await fetch(
      `${SERVICE_ENDPOINTS.complianceEngine}/rules/${id}`,
      {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update compliance rule: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // Classification Methods
  async classifyDocument(documentId: string): Promise<DocumentClassification> {
    const response = await fetch(
      `${SERVICE_ENDPOINTS.documentClassification}/classify`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ documentId }),
      },
    );

    if (!response.ok) {
      throw new Error(`Document classification failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Monitoring Methods
  async getComplianceStatus(documentId?: string): Promise<{
    overall: { score: number; status: string };
    byFramework: Record<ComplianceFramework, { score: number; status: string }>;
    recentChecks: ComplianceCheck[];
  }> {
    const url = documentId
      ? `${SERVICE_ENDPOINTS.complianceMonitoring}/status?documentId=${documentId}`
      : `${SERVICE_ENDPOINTS.complianceMonitoring}/status`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch compliance status: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // Audit Trail Methods
  async getAuditTrail(documentId: string): Promise<{
    events: Array<{
      id: string;
      action: string;
      userId: string;
      userName: string;
      timestamp: string;
      details: Record<string, any>;
    }>;
  }> {
    const response = await fetch(
      `${SERVICE_ENDPOINTS.auditTrail}/${documentId}`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch audit trail: ${response.statusText}`);
    }

    return response.json();
  }

  // Utility Methods
  async getDocumentTypes(): Promise<DocumentType[]> {
    return [
      "regulation",
      "policy",
      "procedure",
      "guideline",
      "standard",
      "circular",
      "directive",
      "framework",
      "template",
      "form",
    ];
  }

  async getDocumentCategories(): Promise<DocumentCategory[]> {
    return [
      "healthcare",
      "clinical",
      "administrative",
      "financial",
      "legal",
      "technical",
      "operational",
      "quality",
      "safety",
      "compliance",
    ];
  }

  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    return [
      "DOH",
      "ADHICS",
      "JAWDA",
      "DAMAN",
      "MALAFFI",
      "HIPAA",
      "GDPR",
      "ISO27001",
      "SOC2",
      "NIST",
    ];
  }
}

// Export singleton instance
export const governanceRegulationsAPI = new GovernanceRegulationsAPI();
export default governanceRegulationsAPI;
