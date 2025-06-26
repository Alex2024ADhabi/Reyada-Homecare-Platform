/**
 * Document Management Service
 * Phase 1: Core Foundation - Document lifecycle management
 */

import {
  governanceRegulationsAPI,
  Document,
  DocumentMetadata,
  DocumentClassification,
  SearchQuery,
  SearchResult,
  UploadRequest,
  UploadResponse,
} from "@/api/governance-regulations.api";

export interface DocumentService {
  uploadDocument(request: UploadRequest): Promise<UploadResponse>;
  getDocument(id: string): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  searchDocuments(query: SearchQuery): Promise<SearchResult>;
  getDocumentVersions(id: string): Promise<Document[]>;
  validateDocument(document: Document): Promise<ValidationResult>;
  processDocument(documentId: string): Promise<ProcessingResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
  code: string;
}

export interface ProcessingResult {
  status: "success" | "processing" | "failed";
  extractedMetadata: Partial<DocumentMetadata>;
  suggestedClassification: Partial<DocumentClassification>;
  suggestedTags: string[];
  processingTime: number;
  confidence: number;
}

export class DocumentManagementService implements DocumentService {
  private cache = new Map<string, Document>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize service
    this.setupCacheCleanup();
  }

  private setupCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        const cacheTime = new Date(value.updatedAt).getTime();
        if (now - cacheTime > this.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, this.cacheTimeout);
  }

  async uploadDocument(request: UploadRequest): Promise<UploadResponse> {
    try {
      // Validate file before upload
      this.validateFile(request.file);

      // Upload document
      const response = await governanceRegulationsAPI.uploadDocument(request);

      // Clear cache to ensure fresh data
      this.cache.clear();

      return response;
    } catch (error) {
      console.error("Document upload failed:", error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async getDocument(id: string): Promise<Document> {
    try {
      // Check cache first
      if (this.cache.has(id)) {
        const cached = this.cache.get(id)!;
        const cacheTime = new Date(cached.updatedAt).getTime();
        if (Date.now() - cacheTime < this.cacheTimeout) {
          return cached;
        }
      }

      // Fetch from API
      const document = await governanceRegulationsAPI.getDocument(id);

      // Cache the result
      this.cache.set(id, document);

      return document;
    } catch (error) {
      console.error("Failed to get document:", error);
      throw new Error(`Failed to retrieve document: ${error.message}`);
    }
  }

  async updateDocument(
    id: string,
    updates: Partial<Document>,
  ): Promise<Document> {
    try {
      // Validate updates
      this.validateDocumentUpdates(updates);

      // Update document
      const updatedDocument = await governanceRegulationsAPI.updateDocument(
        id,
        updates,
      );

      // Update cache
      this.cache.set(id, updatedDocument);

      return updatedDocument;
    } catch (error) {
      console.error("Failed to update document:", error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await governanceRegulationsAPI.deleteDocument(id);

      // Remove from cache
      this.cache.delete(id);
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async searchDocuments(query: SearchQuery): Promise<SearchResult> {
    try {
      return await governanceRegulationsAPI.searchDocuments(query);
    } catch (error) {
      console.error("Document search failed:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async getDocumentVersions(id: string): Promise<Document[]> {
    try {
      return await governanceRegulationsAPI.getDocumentVersions(id);
    } catch (error) {
      console.error("Failed to get document versions:", error);
      throw new Error(`Failed to retrieve document versions: ${error.message}`);
    }
  }

  async validateDocument(document: Document): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    try {
      // Required field validation
      if (!document.title?.trim()) {
        errors.push({
          field: "title",
          message: "Document title is required",
          severity: "error",
          code: "REQUIRED_FIELD",
        });
        score -= 20;
      }

      if (!document.content?.trim()) {
        errors.push({
          field: "content",
          message: "Document content is required",
          severity: "error",
          code: "REQUIRED_FIELD",
        });
        score -= 20;
      }

      if (!document.type) {
        errors.push({
          field: "type",
          message: "Document type is required",
          severity: "error",
          code: "REQUIRED_FIELD",
        });
        score -= 15;
      }

      if (!document.category) {
        errors.push({
          field: "category",
          message: "Document category is required",
          severity: "error",
          code: "REQUIRED_FIELD",
        });
        score -= 15;
      }

      // Content quality validation
      if (document.content && document.content.length < 100) {
        warnings.push({
          field: "content",
          message: "Document content is very short",
          recommendation: "Consider adding more detailed content",
          code: "CONTENT_LENGTH",
        });
        score -= 5;
      }

      // Metadata validation
      if (!document.tags || document.tags.length === 0) {
        warnings.push({
          field: "tags",
          message: "No tags specified",
          recommendation: "Add relevant tags to improve searchability",
          code: "MISSING_TAGS",
        });
        score -= 5;
      }

      // Classification validation
      if (!document.classification.level) {
        errors.push({
          field: "classification.level",
          message: "Classification level is required",
          severity: "error",
          code: "REQUIRED_CLASSIFICATION",
        });
        score -= 10;
      }

      // Version validation
      if (!document.version || !this.isValidVersion(document.version)) {
        warnings.push({
          field: "version",
          message: "Invalid or missing version format",
          recommendation: "Use semantic versioning (e.g., 1.0.0)",
          code: "INVALID_VERSION",
        });
        score -= 5;
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score: Math.max(0, score),
      };
    } catch (error) {
      console.error("Document validation failed:", error);
      return {
        isValid: false,
        errors: [
          {
            field: "system",
            message: "Validation process failed",
            severity: "error",
            code: "VALIDATION_ERROR",
          },
        ],
        warnings: [],
        score: 0,
      };
    }
  }

  async processDocument(documentId: string): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      const document = await this.getDocument(documentId);

      // Extract metadata from content
      const extractedMetadata = this.extractMetadata(document);

      // Suggest classification
      const suggestedClassification = this.suggestClassification(document);

      // Suggest tags
      const suggestedTags = this.suggestTags(document);

      const processingTime = Date.now() - startTime;

      return {
        status: "success",
        extractedMetadata,
        suggestedClassification,
        suggestedTags,
        processingTime,
        confidence: this.calculateConfidence(
          document,
          extractedMetadata,
          suggestedTags,
        ),
      };
    } catch (error) {
      console.error("Document processing failed:", error);
      return {
        status: "failed",
        extractedMetadata: {},
        suggestedClassification: {},
        suggestedTags: [],
        processingTime: Date.now() - startTime,
        confidence: 0,
      };
    }
  }

  // Private helper methods
  private validateFile(file: File): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/html",
      "application/json",
    ];

    if (file.size > maxSize) {
      throw new Error("File size exceeds maximum limit of 50MB");
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }
  }

  private validateDocumentUpdates(updates: Partial<Document>): void {
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error("Document title cannot be empty");
    }

    if (updates.content !== undefined && !updates.content.trim()) {
      throw new Error("Document content cannot be empty");
    }

    if (updates.version && !this.isValidVersion(updates.version)) {
      throw new Error(
        "Invalid version format. Use semantic versioning (e.g., 1.0.0)",
      );
    }
  }

  private isValidVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  }

  private extractMetadata(document: Document): Partial<DocumentMetadata> {
    const metadata: Partial<DocumentMetadata> = {};

    // Extract dates from content
    const dateRegex =
      /\b(\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/g;
    const dates = document.content.match(dateRegex);

    if (dates && dates.length > 0) {
      // Try to identify effective date
      const effectiveDateKeywords = [
        "effective",
        "valid from",
        "starts",
        "begins",
      ];
      for (const keyword of effectiveDateKeywords) {
        const regex = new RegExp(`${keyword}[^\d]*([\d/-]+)`, "i");
        const match = document.content.match(regex);
        if (match) {
          metadata.effectiveDate = this.parseDate(match[1]);
          break;
        }
      }
    }

    // Extract jurisdiction
    const jurisdictionKeywords = [
      "UAE",
      "Dubai",
      "Abu Dhabi",
      "Federal",
      "Emirates",
    ];
    for (const keyword of jurisdictionKeywords) {
      if (document.content.toLowerCase().includes(keyword.toLowerCase())) {
        metadata.jurisdiction = keyword;
        break;
      }
    }

    return metadata;
  }

  private suggestClassification(
    document: Document,
  ): Partial<DocumentClassification> {
    const classification: Partial<DocumentClassification> = {};

    // Suggest sensitivity based on content
    const sensitiveKeywords = [
      "confidential",
      "restricted",
      "classified",
      "private",
    ];
    const highSensitivityKeywords = [
      "patient",
      "medical",
      "health",
      "personal",
    ];

    const content = document.content.toLowerCase();

    if (sensitiveKeywords.some((keyword) => content.includes(keyword))) {
      classification.level = "confidential";
      classification.sensitivity = "high";
    } else if (
      highSensitivityKeywords.some((keyword) => content.includes(keyword))
    ) {
      classification.level = "internal";
      classification.sensitivity = "medium";
    } else {
      classification.level = "internal";
      classification.sensitivity = "low";
    }

    // Suggest compliance frameworks
    const frameworks: string[] = [];
    if (content.includes("doh") || content.includes("health"))
      frameworks.push("DOH");
    if (content.includes("adhics")) frameworks.push("ADHICS");
    if (content.includes("jawda")) frameworks.push("JAWDA");
    if (content.includes("daman")) frameworks.push("DAMAN");
    if (content.includes("hipaa")) frameworks.push("HIPAA");
    if (content.includes("gdpr")) frameworks.push("GDPR");

    classification.complianceFrameworks = frameworks;

    // Suggest retention period based on document type
    const retentionMap = {
      regulation: 10,
      policy: 7,
      procedure: 5,
      guideline: 3,
      standard: 7,
      circular: 2,
      directive: 5,
      framework: 10,
      template: 3,
      form: 2,
    };

    classification.retentionPeriod = retentionMap[document.type] || 5;

    return classification;
  }

  private suggestTags(document: Document): string[] {
    const tags = new Set<string>();
    const content = document.content.toLowerCase();

    // Healthcare-specific tags
    const healthcareTags = {
      "patient care": ["patient", "care", "treatment"],
      clinical: ["clinical", "medical", "diagnosis"],
      nursing: ["nurse", "nursing", "bedside"],
      pharmacy: ["pharmacy", "medication", "drug"],
      laboratory: ["lab", "laboratory", "test", "specimen"],
      radiology: ["radiology", "imaging", "xray", "mri"],
      emergency: ["emergency", "urgent", "critical"],
      quality: ["quality", "improvement", "standards"],
      safety: ["safety", "risk", "incident"],
      compliance: ["compliance", "regulation", "audit"],
    };

    for (const [tag, keywords] of Object.entries(healthcareTags)) {
      if (keywords.some((keyword) => content.includes(keyword))) {
        tags.add(tag);
      }
    }

    // Add document type and category as tags
    tags.add(document.type);
    tags.add(document.category);

    return Array.from(tags);
  }

  private calculateConfidence(
    document: Document,
    metadata: Partial<DocumentMetadata>,
    tags: string[],
  ): number {
    let confidence = 0;

    // Base confidence from document completeness
    if (document.title) confidence += 20;
    if (document.content && document.content.length > 100) confidence += 30;
    if (document.type) confidence += 15;
    if (document.category) confidence += 15;

    // Confidence from extracted metadata
    if (metadata.effectiveDate) confidence += 5;
    if (metadata.jurisdiction) confidence += 5;

    // Confidence from suggested tags
    if (tags.length > 2) confidence += 10;

    return Math.min(100, confidence);
  }

  private parseDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  }

  // Public utility methods
  async getDocumentStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const searchResult = await this.searchDocuments({
        pagination: { page: 1, limit: 1 },
      });

      return {
        total: searchResult.total,
        byType: searchResult.facets.types,
        byCategory: searchResult.facets.categories,
        byStatus: searchResult.facets.statuses,
      };
    } catch (error) {
      console.error("Failed to get document stats:", error);
      return {
        total: 0,
        byType: {},
        byCategory: {},
        byStatus: {},
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const documentManagementService = new DocumentManagementService();
export default documentManagementService;
