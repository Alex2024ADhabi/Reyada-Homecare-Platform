#!/usr/bin/env tsx
/**
 * Test Helpers
 * Utility functions and helpers for healthcare platform testing
 */

import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

// Healthcare-specific test data generators
export class HealthcareTestDataGenerator {
  static generatePatientData(overrides: Partial<any> = {}) {
    return {
      id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emiratesId: this.generateEmiratesId(),
      firstName: "Ahmed",
      lastName: "Al-Rashid",
      dateOfBirth: "1985-03-15",
      gender: "male",
      nationality: "UAE",
      phone: "+971501234567",
      email: "ahmed.alrashid@example.com",
      address: {
        street: "Sheikh Zayed Road",
        city: "Dubai",
        emirate: "Dubai",
        postalCode: "12345",
      },
      insurance: {
        provider: "DAMAN",
        policyNumber: "DM123456789",
        expiryDate: "2024-12-31",
      },
      medicalHistory: {
        allergies: ["Penicillin"],
        chronicConditions: ["Diabetes Type 2"],
        medications: ["Metformin 500mg"],
      },
      ...overrides,
    };
  }

  static generateClinicianData(overrides: Partial<any> = {}) {
    return {
      id: `clinician-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emiratesId: this.generateEmiratesId(),
      firstName: "Dr. Fatima",
      lastName: "Al-Zahra",
      specialization: "Internal Medicine",
      licenseNumber: "DOH-12345",
      licenseExpiry: "2025-06-30",
      phone: "+971502345678",
      email: "dr.fatima@hospital.ae",
      qualifications: ["MBBS", "MD Internal Medicine"],
      experience: 8,
      ...overrides,
    };
  }

  static generateAssessmentData(
    type: string = "initial",
    overrides: Partial<any> = {},
  ) {
    const baseAssessment = {
      id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      patientId: "patient-123",
      clinicianId: "clinician-456",
      date: new Date().toISOString(),
      status: "completed",
      findings: {
        vitalSigns: {
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 36.5,
          respiratoryRate: 16,
          oxygenSaturation: 98,
        },
        physicalExam: {
          general: "Patient appears well",
          cardiovascular: "Regular rate and rhythm",
          respiratory: "Clear to auscultation bilaterally",
          neurological: "Alert and oriented x3",
        },
      },
      recommendations: [
        "Continue current medications",
        "Follow up in 2 weeks",
        "Monitor blood glucose levels",
      ],
      signature: {
        clinician: "Dr. Fatima Al-Zahra",
        timestamp: new Date().toISOString(),
        verified: true,
      },
    };

    return { ...baseAssessment, ...overrides };
  }

  static generateEmiratesId(): string {
    // Generate a mock Emirates ID (15 digits)
    const year = "784";
    const century = "1985";
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const checkDigit = Math.floor(Math.random() * 10);
    return `${year}${century}${random}${checkDigit}`;
  }

  static generateDamanClaim(overrides: Partial<any> = {}) {
    return {
      id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: "patient-123",
      providerId: "provider-456",
      policyNumber: "DM123456789",
      serviceDate: new Date().toISOString().split("T")[0],
      services: [
        {
          code: "H001",
          description: "Home Visit - Initial Assessment",
          quantity: 1,
          unitPrice: 250.0,
          totalPrice: 250.0,
        },
      ],
      totalAmount: 250.0,
      status: "submitted",
      submissionDate: new Date().toISOString(),
      ...overrides,
    };
  }
}

// Test environment utilities
export class TestEnvironmentHelper {
  static async setupTestDatabase(): Promise<void> {
    // Mock database setup
    console.log("🗄️  Setting up test database...");
    // In real implementation, would set up test database
  }

  static async cleanupTestDatabase(): Promise<void> {
    // Mock database cleanup
    console.log("🧹 Cleaning up test database...");
    // In real implementation, would clean up test database
  }

  static async setupTestFiles(): Promise<void> {
    const testDir = "test-temp";
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    console.log("📁 Test files directory created");
  }

  static async cleanupTestFiles(): Promise<void> {
    const testDir = "test-temp";
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    console.log("🗑️  Test files cleaned up");
  }

  static getTestConfig(): any {
    return {
      database: {
        host: "localhost",
        port: 5432,
        database: "healthcare_test",
        username: "test_user",
        password: "test_password",
      },
      api: {
        baseUrl: "http://localhost:3001",
        timeout: 10000,
      },
      browser: {
        headless: process.env.CI === "true",
        slowMo: 100,
        viewport: { width: 1280, height: 720 },
      },
    };
  }
}

// Performance testing utilities
export class PerformanceTestHelper {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(name: string): number {
    const startTime = performance.now();
    console.log(`⏱️  Started measuring: ${name}`);
    return startTime;
  }

  static endMeasurement(name: string, startTime: number): number {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    console.log(`⏱️  Completed measuring: ${name} (${duration.toFixed(2)}ms)`);
    return duration;
  }

  static getAverageTime(name: string): number {
    const times = this.measurements.get(name) || [];
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  static getPercentile(name: string, percentile: number): number {
    const times = this.measurements.get(name) || [];
    if (times.length === 0) return 0;

    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index] || 0;
  }

  static generatePerformanceReport(): any {
    const report: any = {
      timestamp: new Date().toISOString(),
      measurements: {},
    };

    for (const [name, times] of this.measurements.entries()) {
      report.measurements[name] = {
        count: times.length,
        average: this.getAverageTime(name),
        min: Math.min(...times),
        max: Math.max(...times),
        p50: this.getPercentile(name, 50),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
      };
    }

    return report;
  }

  static reset(): void {
    this.measurements.clear();
  }
}

// Compliance testing utilities
export class ComplianceTestHelper {
  static validateDOHCompliance(data: any): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Mock DOH validation rules
    if (!data.patientConsent) {
      violations.push("Patient consent not documented");
    }

    if (!data.clinicianSignature) {
      violations.push("Clinician signature missing");
    }

    if (!data.timestamp) {
      violations.push("Timestamp not recorded");
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  static validateDAMANCompliance(claimData: any): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Mock DAMAN validation rules
    if (!claimData.policyNumber) {
      violations.push("Policy number is required");
    }

    if (!claimData.serviceDate) {
      violations.push("Service date is required");
    }

    if (!claimData.services || claimData.services.length === 0) {
      violations.push("At least one service must be specified");
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  static validateJAWDACompliance(qualityData: any): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Mock JAWDA validation rules
    if (!qualityData.patientSafetyMetrics) {
      violations.push("Patient safety metrics not recorded");
    }

    if (!qualityData.clinicalEffectiveness) {
      violations.push("Clinical effectiveness measures missing");
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  static validateHIPAACompliance(data: any): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Mock HIPAA validation rules
    if (!data.encryption) {
      violations.push("Data must be encrypted");
    }

    if (!data.accessControls) {
      violations.push("Access controls not implemented");
    }

    if (!data.auditLog) {
      violations.push("Audit logging not enabled");
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }
}

// Accessibility testing utilities
export class AccessibilityTestHelper {
  static async checkWCAGCompliance(
    element: any,
  ): Promise<{ violations: any[]; passes: any[] }> {
    // Mock accessibility check
    return {
      violations: [],
      passes: [
        { id: "color-contrast", description: "Color contrast is sufficient" },
        { id: "keyboard-navigation", description: "Keyboard navigation works" },
      ],
    };
  }

  static async checkAriaLabels(element: any): Promise<boolean> {
    // Mock ARIA label check
    return true;
  }

  static async checkKeyboardNavigation(element: any): Promise<boolean> {
    // Mock keyboard navigation check
    return true;
  }
}

// Security testing utilities
export class SecurityTestHelper {
  static async checkSQLInjection(
    input: string,
  ): Promise<{ vulnerable: boolean; details?: string }> {
    const sqlPatterns = ["'", '"', ";", "--", "/*", "*/", "xp_", "sp_"];
    const vulnerable = sqlPatterns.some((pattern) => input.includes(pattern));

    return {
      vulnerable,
      details: vulnerable
        ? "Potential SQL injection vulnerability detected"
        : undefined,
    };
  }

  static async checkXSSVulnerability(
    input: string,
  ): Promise<{ vulnerable: boolean; details?: string }> {
    const xssPatterns = ["<script", "javascript:", "onload=", "onerror="];
    const vulnerable = xssPatterns.some((pattern) =>
      input.toLowerCase().includes(pattern),
    );

    return {
      vulnerable,
      details: vulnerable ? "Potential XSS vulnerability detected" : undefined,
    };
  }

  static async checkCSRFProtection(
    request: any,
  ): Promise<{ protected: boolean; details?: string }> {
    // Mock CSRF protection check
    const hasToken =
      request.headers?.["x-csrf-token"] || request.body?.csrfToken;

    return {
      protected: !!hasToken,
      details: hasToken ? undefined : "CSRF token missing",
    };
  }
}

// File and directory utilities
export class FileTestHelper {
  static async createTempFile(
    content: string,
    extension: string = ".txt",
  ): Promise<string> {
    const tempDir = "test-temp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `temp-${Date.now()}${extension}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, content);
    return filePath;
  }

  static async readTestFile(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, "utf8");
  }

  static async deleteTestFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static async compareFiles(file1: string, file2: string): Promise<boolean> {
    const content1 = await this.readTestFile(file1);
    const content2 = await this.readTestFile(file2);
    return content1 === content2;
  }
}

// Wait and retry utilities
export class WaitHelper {
  static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    options: { timeout?: number; interval?: number } = {},
  ): Promise<boolean> {
    const timeout = options.timeout || 10000;
    const interval = options.interval || 100;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) {
        return true;
      }
      await this.wait(interval);
    }

    return false;
  }

  static async retry<T>(
    fn: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {},
  ): Promise<T> {
    const maxAttempts = options.maxAttempts || 3;
    const delay = options.delay || 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.wait(delay);
      }
    }

    throw new Error("All retry attempts failed");
  }
}

// Mock API utilities
export class MockAPIHelper {
  private static mocks: Map<string, any> = new Map();

  static mockEndpoint(endpoint: string, response: any): void {
    this.mocks.set(endpoint, response);
  }

  static getMockResponse(endpoint: string): any {
    return this.mocks.get(endpoint);
  }

  static clearMocks(): void {
    this.mocks.clear();
  }

  static setupHealthcareAPIMocks(): void {
    // Mock patient API
    this.mockEndpoint("/api/patients", {
      status: 200,
      data: [HealthcareTestDataGenerator.generatePatientData()],
    });

    // Mock clinician API
    this.mockEndpoint("/api/clinicians", {
      status: 200,
      data: [HealthcareTestDataGenerator.generateClinicianData()],
    });

    // Mock assessment API
    this.mockEndpoint("/api/assessments", {
      status: 200,
      data: [HealthcareTestDataGenerator.generateAssessmentData()],
    });

    // Mock DAMAN API
    this.mockEndpoint("/api/daman/claims", {
      status: 200,
      data: { claimId: "CL123456", status: "approved" },
    });
  }
}

// Export all helpers
export {
  HealthcareTestDataGenerator,
  TestEnvironmentHelper,
  PerformanceTestHelper,
  ComplianceTestHelper,
  AccessibilityTestHelper,
  SecurityTestHelper,
  FileTestHelper,
  WaitHelper,
  MockAPIHelper,
};

// Default export for convenience
export default {
  HealthcareTestDataGenerator,
  TestEnvironmentHelper,
  PerformanceTestHelper,
  ComplianceTestHelper,
  AccessibilityTestHelper,
  SecurityTestHelper,
  FileTestHelper,
  WaitHelper,
  MockAPIHelper,
};
