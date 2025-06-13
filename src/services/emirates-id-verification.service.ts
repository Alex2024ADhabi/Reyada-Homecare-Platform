/**
 * Emirates ID Verification Service
 * Provides OCR scanning, format validation, and government database verification
 * FIXED: Template literal syntax errors corrected
 */

import { SecurityService, AuditLogger } from "@/services/security.service";

export interface EmiratesIdData {
  emiratesId: string;
  fullNameEnglish: string;
  fullNameArabic: string;
  nationality: string;
  dateOfBirth: string;
  gender: "male" | "female";
  issueDate: string;
  expiryDate: string;
  cardNumber: string;
  isValid: boolean;
  verificationStatus: "verified" | "pending" | "failed" | "expired";
}

export interface EmiratesIdScanResult {
  success: boolean;
  data?: EmiratesIdData;
  error?: string;
  confidence: number;
  processingTime: number;
}

export interface EmiratesIdValidationResult {
  isValid: boolean;
  isFormatValid: boolean;
  isGovernmentVerified: boolean;
  isDuplicate: boolean;
  errors: string[];
  warnings: string[];
  verificationDetails: {
    formatCheck: boolean;
    checksumValid: boolean;
    governmentDbCheck: boolean;
    duplicateCheck: boolean;
    expiryCheck: boolean;
  };
}

// Enhanced data encryption utilities for Emirates ID service
export class DataEncryption {
  /**
   * Encrypt sensitive fields in Emirates ID data
   */
  static async encryptSensitiveFields(
    data: any,
    isDamanData: boolean = false,
  ): Promise<any> {
    try {
      if (!data || typeof data !== "object") return data;

      const sensitiveFields = [
        "emiratesId",
        "fullNameEnglish",
        "fullNameArabic",
        "dateOfBirth",
      ];
      const encryptedData = { ...data };

      for (const field of sensitiveFields) {
        if (encryptedData[field]) {
          // Simulate encryption - in production use proper encryption
          encryptedData[field] = btoa(encryptedData[field]);
        }
      }

      return encryptedData;
    } catch (error) {
      console.error("Encryption failed:", error);
      return data;
    }
  }

  /**
   * Decrypt sensitive fields in Emirates ID data
   */
  static async decryptSensitiveFields(
    data: any,
    isDamanData: boolean = false,
  ): Promise<any> {
    try {
      if (!data || typeof data !== "object") return data;

      const sensitiveFields = [
        "emiratesId",
        "fullNameEnglish",
        "fullNameArabic",
        "dateOfBirth",
      ];
      const decryptedData = { ...data };

      for (const field of sensitiveFields) {
        if (decryptedData[field]) {
          try {
            // Simulate decryption - in production use proper decryption
            decryptedData[field] = atob(decryptedData[field]);
          } catch {
            // If decryption fails, assume data is not encrypted
          }
        }
      }

      return decryptedData;
    } catch (error) {
      console.error("Decryption failed:", error);
      return data;
    }
  }
}

class EmiratesIdVerificationService {
  private readonly API_BASE_URL =
    process.env.UAE_GOV_API_URL || "https://api.government.ae/v1";
  private readonly API_KEY = process.env.UAE_GOV_API_KEY || "";
  private readonly OCR_SERVICE_URL =
    process.env.OCR_SERVICE_URL || "https://ocr.api.ae/v1";

  /**
   * Scan Emirates ID using OCR
   * FIXED: Template literal syntax corrected
   */
  async scanEmiratesId(imageFile: File | Blob): Promise<EmiratesIdScanResult> {
    const startTime = Date.now();

    try {
      // Validate image file
      if (!this.isValidImageFile(imageFile)) {
        return {
          success: false,
          error: "Invalid image file format. Please use JPG, PNG, or PDF.",
          confidence: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Prepare form data for OCR service
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("document_type", "emirates_id");
      formData.append("extract_fields", "all");

      // Call OCR service - FIXED: Template literal properly formatted with null checks
      const ocrUrl = this.OCR_SERVICE_URL
        ? `${this.OCR_SERVICE_URL}/extract`
        : null;
      if (!ocrUrl) {
        throw new Error("OCR service URL not configured");
      }

      const response = await fetch(ocrUrl, {
        method: "POST",
        headers: {
          Authorization: this.API_KEY ? `Bearer ${this.API_KEY}` : "",
          "X-Service-Type": "emirates-id-ocr",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR service error: ${response.statusText}`);
      }

      const ocrResult = await response.json();

      if (!ocrResult || !ocrResult.success) {
        return {
          success: false,
          error: ocrResult?.error || "OCR processing failed",
          confidence: ocrResult?.confidence || 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Extract Emirates ID data from OCR result with null safety
      const fields = ocrResult.fields || {};
      const emiratesIdData: EmiratesIdData = {
        emiratesId: fields.emirates_id || "",
        fullNameEnglish: fields.name_english || "",
        fullNameArabic: fields.name_arabic || "",
        nationality: fields.nationality || "",
        dateOfBirth: fields.date_of_birth || "",
        gender: fields.gender?.toLowerCase() === "female" ? "female" : "male",
        issueDate: fields.issue_date || "",
        expiryDate: fields.expiry_date || "",
        cardNumber: fields.card_number || "",
        isValid: false, // Will be validated separately
        verificationStatus: "pending",
      };

      // Validate extracted data
      const validation = await this.validateEmiratesId(
        emiratesIdData.emiratesId,
      );
      emiratesIdData.isValid = validation.isValid;
      emiratesIdData.verificationStatus = validation.isValid
        ? "verified"
        : "failed";

      AuditLogger.logSecurityEvent({
        type: "emirates_id_scanned",
        details: {
          emiratesId: emiratesIdData.emiratesId,
          confidence: ocrResult.confidence,
          isValid: emiratesIdData.isValid,
        },
        severity: "low",
        complianceImpact: true,
      });

      return {
        success: true,
        data: emiratesIdData,
        confidence: ocrResult.confidence || 0,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Emirates ID scanning error:", error);

      AuditLogger.logSecurityEvent({
        type: "emirates_id_scan_failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        severity: "medium",
        complianceImpact: true,
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Emirates ID scanning failed",
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate Emirates ID format and verify with government database
   */
  async validateEmiratesId(
    emiratesId: string,
  ): Promise<EmiratesIdValidationResult> {
    const result: EmiratesIdValidationResult = {
      isValid: false,
      isFormatValid: false,
      isGovernmentVerified: false,
      isDuplicate: false,
      errors: [],
      warnings: [],
      verificationDetails: {
        formatCheck: false,
        checksumValid: false,
        governmentDbCheck: false,
        duplicateCheck: false,
        expiryCheck: false,
      },
    };

    try {
      // 1. Format validation
      const formatValid = this.validateEmiratesIdFormat(emiratesId);
      result.isFormatValid = formatValid;
      result.verificationDetails.formatCheck = formatValid;

      if (!formatValid) {
        result.errors.push(
          "Invalid Emirates ID format. Expected format: 784-YYYY-XXXXXXX-X",
        );
        return result;
      }

      // 2. Checksum validation
      const checksumValid = this.validateEmiratesIdChecksum(emiratesId);
      result.verificationDetails.checksumValid = checksumValid;

      if (!checksumValid) {
        result.errors.push("Invalid Emirates ID checksum");
        return result;
      }

      // 3. Government database verification
      try {
        const govVerification =
          await this.verifyWithGovernmentDatabase(emiratesId);
        result.isGovernmentVerified = govVerification.isValid;
        result.verificationDetails.governmentDbCheck = govVerification.isValid;
        result.verificationDetails.expiryCheck = !govVerification.isExpired;

        if (!govVerification.isValid) {
          result.errors.push(
            govVerification.error || "Government database verification failed",
          );
        }

        if (govVerification.isExpired) {
          result.warnings.push("Emirates ID has expired");
        }
      } catch (error) {
        result.errors.push("Unable to verify with government database");
        result.warnings.push(
          "Government database verification temporarily unavailable",
        );
      }

      // 4. Duplicate check
      try {
        const duplicateCheck = await this.checkForDuplicates(emiratesId);
        result.isDuplicate = duplicateCheck.isDuplicate;
        result.verificationDetails.duplicateCheck = !duplicateCheck.isDuplicate;

        if (duplicateCheck.isDuplicate) {
          result.errors.push(
            `Emirates ID already exists in the system (Patient ID: ${duplicateCheck.existingPatientId})`,
          );
        }
      } catch (error) {
        result.warnings.push("Unable to perform duplicate check");
      }

      // Overall validation result
      result.isValid =
        result.isFormatValid &&
        result.verificationDetails.checksumValid &&
        result.isGovernmentVerified &&
        !result.isDuplicate;

      AuditLogger.logSecurityEvent({
        type: "emirates_id_validated",
        details: {
          emiratesId,
          isValid: result.isValid,
          isGovernmentVerified: result.isGovernmentVerified,
          isDuplicate: result.isDuplicate,
        },
        severity: result.isValid ? "low" : "medium",
        complianceImpact: true,
      });

      return result;
    } catch (error) {
      console.error("Emirates ID validation error:", error);
      result.errors.push("Validation process failed");
      return result;
    }
  }

  /**
   * Validate Emirates ID format
   */
  private validateEmiratesIdFormat(emiratesId: string): boolean {
    // Emirates ID format: 784-YYYY-XXXXXXX-X
    const emiratesIdPattern = /^784-[0-9]{4}-[0-9]{7}-[0-9]$/;
    return emiratesIdPattern.test(emiratesId);
  }

  /**
   * Validate Emirates ID checksum
   */
  private validateEmiratesIdChecksum(emiratesId: string): boolean {
    try {
      // Remove hyphens and extract digits
      const digits = emiratesId.replace(/-/g, "");

      if (digits.length !== 15) {
        return false;
      }

      // Calculate checksum using Luhn algorithm (simplified)
      let sum = 0;
      for (let i = 0; i < 14; i++) {
        let digit = parseInt(digits[i]);
        if (i % 2 === 0) {
          digit *= 2;
          if (digit > 9) {
            digit = digit - 9;
          }
        }
        sum += digit;
      }

      const checkDigit = (10 - (sum % 10)) % 10;
      return checkDigit === parseInt(digits[14]);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Emirates ID with UAE government database
   * FIXED: Template literal properly formatted
   */
  private async verifyWithGovernmentDatabase(emiratesId: string): Promise<{
    isValid: boolean;
    isExpired: boolean;
    error?: string;
  }> {
    try {
      const apiUrl = this.API_BASE_URL
        ? `${this.API_BASE_URL}/identity/verify`
        : null;
      if (!apiUrl) {
        throw new Error("Government API URL not configured");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: this.API_KEY ? `Bearer ${this.API_KEY}` : "",
          "Content-Type": "application/json",
          "X-Service-Type": "emirates-id-verification",
        },
        body: JSON.stringify({
          emirates_id: emiratesId || "",
          verification_type: "full",
        }),
      });

      if (!response.ok) {
        throw new Error(`Government API error: ${response.statusText}`);
      }

      const verificationResult = await response.json();

      return {
        isValid: verificationResult?.is_valid || false,
        isExpired: verificationResult?.is_expired || false,
        error: verificationResult?.error,
      };
    } catch (error) {
      console.error("Government database verification error:", error);
      throw error;
    }
  }

  /**
   * Check for duplicate Emirates IDs in the system
   */
  private async checkForDuplicates(emiratesId: string): Promise<{
    isDuplicate: boolean;
    existingPatientId?: string;
  }> {
    try {
      // This would typically query your local database
      // For now, we'll simulate the check
      const response = await fetch("/api/patients/check-duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emiratesId }),
      });

      if (!response.ok) {
        throw new Error("Duplicate check failed");
      }

      const result = await response.json();
      return {
        isDuplicate: result.isDuplicate || false,
        existingPatientId: result.existingPatientId,
      };
    } catch (error) {
      console.error("Duplicate check error:", error);
      throw error;
    }
  }

  /**
   * Validate image file for OCR processing
   */
  private isValidImageFile(file: File | Blob): boolean {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file instanceof File) {
      return validTypes.includes(file.type) && file.size <= maxSize;
    }

    return file.size <= maxSize;
  }

  /**
   * Extract Emirates ID number from scanned text
   */
  extractEmiratesIdFromText(text: string): string | null {
    const emiratesIdPattern = /784-[0-9]{4}-[0-9]{7}-[0-9]/g;
    const matches = text.match(emiratesIdPattern);
    return matches ? matches[0] : null;
  }

  /**
   * Format Emirates ID for display
   */
  formatEmiratesId(emiratesId: string): string {
    // Remove any existing formatting
    const cleaned = emiratesId.replace(/[^0-9]/g, "");

    if (cleaned.length === 15) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 14)}-${cleaned.slice(14)}`;
    }

    return emiratesId;
  }
}

// Export singleton instance
export const emiratesIdVerificationService =
  new EmiratesIdVerificationService();
export default emiratesIdVerificationService;
