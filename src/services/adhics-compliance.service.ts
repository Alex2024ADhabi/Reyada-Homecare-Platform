/**
 * ADHICS V2 Compliance Service
 * Comprehensive compliance validation and monitoring for Abu Dhabi Healthcare Information and Cyber Security Standard V2
 */

import { JsonValidator } from "@/utils/json-validator";
import { JSXValidator } from "@/utils/jsx-validator";
import { SecurityService, AuditLogger } from "./security.service";
import { COMPLIANCE_CONFIG } from "@/config/security.config";

export interface ADHICSComplianceResult {
  isCompliant: boolean;
  overallScore: number;
  sectionAScore: number;
  sectionBScore: number;
  violations: ADHICSViolation[];
  recommendations: string[];
  complianceLevel: "Excellent" | "Good" | "Acceptable" | "Needs Improvement";
  lastAssessment: string;
  nextAssessmentDue: string;
  certificationStatus: "Certified" | "Pending" | "Expired" | "Not Certified";
}

export interface ADHICSViolation {
  id: string;
  section: "A" | "B";
  control: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  remediation: string[];
  deadline: string;
  status: "Open" | "In Progress" | "Resolved" | "Deferred";
  assignedTo?: string;
  estimatedEffort?: string;
}

export interface ADHICSControlImplementation {
  controlId: string;
  section: "A" | "B";
  category: string;
  title: string;
  description: string;
  implementationStatus:
    | "Implemented"
    | "Partially Implemented"
    | "Not Implemented"
    | "Not Applicable";
  evidenceProvided: boolean;
  lastReviewed: string;
  reviewedBy: string;
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  businessImpact: "Low" | "Medium" | "High" | "Critical";
  implementationNotes?: string;
  attachments?: string[];
}

class ADHICSComplianceService {
  private static instance: ADHICSComplianceService;
  private complianceData: Map<string, any> = new Map();
  private lastAssessment: Date | null = null;
  private violations: ADHICSViolation[] = [];
  private controlImplementations: Map<string, ADHICSControlImplementation> =
    new Map();

  private constructor() {
    this.initializeADHICSControls();
  }

  public static getInstance(): ADHICSComplianceService {
    if (!ADHICSComplianceService.instance) {
      ADHICSComplianceService.instance = new ADHICSComplianceService();
    }
    return ADHICSComplianceService.instance;
  }

  /**
   * Initialize ADHICS V2 control framework
   */
  private initializeADHICSControls(): void {
    // Section A - Governance and Framework Controls
    const sectionAControls: Partial<ADHICSControlImplementation>[] = [
      {
        controlId: "2.1.1",
        section: "A",
        category: "Information Security Governance",
        title: "Information Security Governance Committee (ISGC)",
        description:
          "Establish and maintain an Information Security Governance Committee",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Low",
        businessImpact: "High",
      },
      {
        controlId: "2.1.2",
        section: "A",
        category: "Information Security Governance",
        title: "HIIP Workgroup",
        description:
          "Establish Healthcare Information and Infrastructure Protection workgroup",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Low",
        businessImpact: "High",
      },
      {
        controlId: "2.1.3",
        section: "A",
        category: "Information Security Governance",
        title: "Chief Information Security Officer (CISO)",
        description: "Designate a Chief Information Security Officer",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 5,
        riskRating: "Low",
        businessImpact: "Critical",
      },
      {
        controlId: "3.1",
        section: "A",
        category: "Risk Management",
        title: "Risk Management Process",
        description: "Implement comprehensive risk management process",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Medium",
        businessImpact: "High",
      },
      {
        controlId: "5.1",
        section: "A",
        category: "Asset Classification",
        title: "Asset Classification Scheme",
        description: "Implement information asset classification scheme",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Medium",
        businessImpact: "High",
      },
    ];

    // Section B - Control Requirements
    const sectionBControls: Partial<ADHICSControlImplementation>[] = [
      {
        controlId: "HR.1.1",
        section: "B",
        category: "Human Resources Security",
        title: "Human Resources Security Policy",
        description: "Establish and maintain human resources security policy",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Medium",
        businessImpact: "High",
      },
      {
        controlId: "AM.1.1",
        section: "B",
        category: "Asset Management",
        title: "Asset Management Policy",
        description: "Establish and maintain asset management policy",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 4,
        riskRating: "Medium",
        businessImpact: "High",
      },
      {
        controlId: "AC.1.1",
        section: "B",
        category: "Access Control",
        title: "Access Control Policy",
        description: "Establish and maintain access control policy",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 5,
        riskRating: "High",
        businessImpact: "Critical",
      },
      {
        controlId: "DP.1.1",
        section: "B",
        category: "Data Privacy and Protection",
        title: "Data Privacy Policy",
        description: "Establish and maintain data privacy policy",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 5,
        riskRating: "Critical",
        businessImpact: "Critical",
      },
      {
        controlId: "SA.3.1",
        section: "B",
        category: "System Acquisition",
        title: "Cryptographic Controls",
        description: "Implement cryptographic controls for data protection",
        implementationStatus: "Implemented",
        evidenceProvided: true,
        maturityLevel: 5,
        riskRating: "High",
        businessImpact: "Critical",
      },
    ];

    // Initialize all controls
    [...sectionAControls, ...sectionBControls].forEach((control) => {
      const fullControl: ADHICSControlImplementation = {
        ...control,
        lastReviewed: new Date().toISOString(),
        reviewedBy: "System Administrator",
        implementationNotes: "Automatically initialized during system setup",
      } as ADHICSControlImplementation;

      this.controlImplementations.set(control.controlId!, fullControl);
    });
  }

  /**
   * Perform comprehensive ADHICS V2 compliance assessment
   */
  public async performComplianceAssessment(): Promise<ADHICSComplianceResult> {
    try {
      const startTime = performance.now();

      // Section A Assessment
      const sectionAResult = await this.assessSectionA();

      // Section B Assessment
      const sectionBResult = await this.assessSectionB();

      // Technical Implementation Assessment
      const technicalResult = await this.assessTechnicalImplementation();

      // Calculate overall scores
      const sectionAScore = this.calculateSectionScore(sectionAResult);
      const sectionBScore = this.calculateSectionScore(sectionBResult);
      const overallScore = Math.round((sectionAScore + sectionBScore) / 2);

      // Determine compliance level
      const complianceLevel = this.determineComplianceLevel(overallScore);

      // Collect all violations
      const violations = [
        ...sectionAResult.violations,
        ...sectionBResult.violations,
        ...technicalResult.violations,
      ];

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        violations,
        overallScore,
      );

      // Update assessment timestamp
      this.lastAssessment = new Date();

      const result: ADHICSComplianceResult = {
        isCompliant:
          overallScore >= 85 &&
          violations.filter((v) => v.severity === "Critical").length === 0,
        overallScore,
        sectionAScore,
        sectionBScore,
        violations,
        recommendations,
        complianceLevel,
        lastAssessment: this.lastAssessment.toISOString(),
        nextAssessmentDue: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 90 days
        certificationStatus:
          overallScore >= 95
            ? "Certified"
            : overallScore >= 85
              ? "Pending"
              : "Not Certified",
      };

      // Log assessment completion
      AuditLogger.logSecurityEvent({
        type: "compliance_violation",
        details: {
          assessmentType: "ADHICS_V2_FULL",
          overallScore,
          sectionAScore,
          sectionBScore,
          violationsCount: violations.length,
          criticalViolations: violations.filter(
            (v) => v.severity === "Critical",
          ).length,
          assessmentDuration: performance.now() - startTime,
        },
        severity:
          violations.filter((v) => v.severity === "Critical").length > 0
            ? "critical"
            : "low",
        complianceImpact: true,
      });

      return result;
    } catch (error) {
      console.error("ADHICS compliance assessment failed:", error);
      throw new Error(
        `Compliance assessment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Assess ADHICS Section A - Governance and Framework
   */
  private async assessSectionA(): Promise<{
    score: number;
    violations: ADHICSViolation[];
  }> {
    const violations: ADHICSViolation[] = [];
    let totalScore = 100;

    // Check ISGC establishment
    if (!this.checkISGCEstablishment()) {
      violations.push({
        id: "ADHICS-A-001",
        section: "A",
        control: "2.1.1",
        severity: "Critical",
        description:
          "Information Security Governance Committee not established",
        remediation: [
          "Establish ISGC with appropriate membership",
          "Define ISGC charter and responsibilities",
          "Schedule regular ISGC meetings",
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 20;
    }

    // Check HIIP Workgroup
    if (!this.checkHIIPWorkgroup()) {
      violations.push({
        id: "ADHICS-A-002",
        section: "A",
        control: "2.1.2",
        severity: "High",
        description: "HIIP Workgroup not established or not active",
        remediation: [
          "Establish HIIP Workgroup",
          "Define workgroup objectives and scope",
          "Assign qualified personnel",
        ],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 15;
    }

    // Check CISO designation
    if (!this.checkCISODesignation()) {
      violations.push({
        id: "ADHICS-A-003",
        section: "A",
        control: "2.1.3",
        severity: "Critical",
        description: "Chief Information Security Officer not designated",
        remediation: [
          "Designate qualified CISO",
          "Define CISO roles and responsibilities",
          "Ensure CISO has appropriate authority and resources",
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 25;
    }

    // Check Risk Management Process
    if (!this.checkRiskManagementProcess()) {
      violations.push({
        id: "ADHICS-A-004",
        section: "A",
        control: "3.1",
        severity: "High",
        description: "Risk management process not implemented",
        remediation: [
          "Implement risk assessment methodology",
          "Conduct regular risk assessments",
          "Maintain risk register",
          "Implement risk treatment measures",
        ],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 20;
    }

    // Check Asset Classification
    if (!this.checkAssetClassification()) {
      violations.push({
        id: "ADHICS-A-005",
        section: "A",
        control: "5.1",
        severity: "Medium",
        description: "Asset classification scheme not implemented",
        remediation: [
          "Develop asset classification scheme",
          "Classify all information assets",
          "Implement handling procedures for each classification level",
        ],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 10;
    }

    return { score: Math.max(0, totalScore), violations };
  }

  /**
   * Assess ADHICS Section B - Control Requirements
   */
  private async assessSectionB(): Promise<{
    score: number;
    violations: ADHICSViolation[];
  }> {
    const violations: ADHICSViolation[] = [];
    let totalScore = 100;

    // Check Human Resources Security
    if (!this.checkHRSecurityPolicy()) {
      violations.push({
        id: "ADHICS-B-001",
        section: "B",
        control: "HR.1.1",
        severity: "Medium",
        description: "Human Resources Security Policy not established",
        remediation: [
          "Develop HR security policy",
          "Implement background verification procedures",
          "Define security roles and responsibilities",
        ],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 10;
    }

    // Check Access Control
    if (!this.checkAccessControlPolicy()) {
      violations.push({
        id: "ADHICS-B-002",
        section: "B",
        control: "AC.1.1",
        severity: "Critical",
        description: "Access Control Policy not implemented",
        remediation: [
          "Develop access control policy",
          "Implement user access management procedures",
          "Deploy multi-factor authentication",
          "Conduct regular access reviews",
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 25;
    }

    // Check Data Privacy and Protection
    if (!this.checkDataPrivacyPolicy()) {
      violations.push({
        id: "ADHICS-B-003",
        section: "B",
        control: "DP.1.1",
        severity: "Critical",
        description: "Data Privacy Policy not implemented",
        remediation: [
          "Develop data privacy policy",
          "Implement data protection measures",
          "Conduct privacy impact assessments",
          "Establish data breach response procedures",
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 30;
    }

    // Check Cryptographic Controls
    if (!this.checkCryptographicControls()) {
      violations.push({
        id: "ADHICS-B-004",
        section: "B",
        control: "SA.3.1",
        severity: "High",
        description: "Cryptographic controls not properly implemented",
        remediation: [
          "Implement strong encryption algorithms",
          "Establish key management procedures",
          "Deploy encryption for data at rest and in transit",
        ],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
      totalScore -= 20;
    }

    return { score: Math.max(0, totalScore), violations };
  }

  /**
   * Assess technical implementation compliance
   */
  private async assessTechnicalImplementation(): Promise<{
    violations: ADHICSViolation[];
  }> {
    const violations: ADHICSViolation[] = [];

    // JSON validation compliance
    try {
      const testData = { test: "data", timestamp: new Date().toISOString() };
      const jsonValidation = JsonValidator.validate(JSON.stringify(testData));

      if (!jsonValidation.isValid) {
        violations.push({
          id: "ADHICS-T-001",
          section: "B",
          control: "SA.2.3",
          severity: "Medium",
          description: "JSON validation framework not properly configured",
          remediation: [
            "Fix JSON validation configuration",
            "Test JSON processing with sample data",
            "Implement proper error handling",
          ],
          deadline: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "Open",
        });
      }
    } catch (error) {
      violations.push({
        id: "ADHICS-T-002",
        section: "B",
        control: "SA.2.3",
        severity: "High",
        description: "JSON validation framework failure",
        remediation: [
          "Investigate JSON validation errors",
          "Fix underlying JSON processing issues",
          "Implement comprehensive testing",
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
    }

    // JSX validation compliance
    try {
      const testElement = { type: "div", props: { children: "test" } };
      const jsxValidation = JSXValidator.validate(testElement);

      if (!jsxValidation.isValid) {
        violations.push({
          id: "ADHICS-T-003",
          section: "B",
          control: "AC.6.1",
          severity: "Medium",
          description: "JSX validation framework not properly configured",
          remediation: [
            "Fix JSX validation configuration",
            "Test JSX processing with sample components",
            "Implement security validation for JSX elements",
          ],
          deadline: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "Open",
        });
      }
    } catch (error) {
      violations.push({
        id: "ADHICS-T-004",
        section: "B",
        control: "AC.6.1",
        severity: "High",
        description: "JSX validation framework failure",
        remediation: [
          "Investigate JSX validation errors",
          "Fix underlying JSX processing issues",
          "Implement comprehensive component testing",
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Open",
      });
    }

    return { violations };
  }

  // Helper methods for compliance checks
  private checkISGCEstablishment(): boolean {
    return (
      this.controlImplementations.get("2.1.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkHIIPWorkgroup(): boolean {
    return (
      this.controlImplementations.get("2.1.2")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkCISODesignation(): boolean {
    return (
      this.controlImplementations.get("2.1.3")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkRiskManagementProcess(): boolean {
    return (
      this.controlImplementations.get("3.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkAssetClassification(): boolean {
    return (
      this.controlImplementations.get("5.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkHRSecurityPolicy(): boolean {
    return (
      this.controlImplementations.get("HR.1.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkAccessControlPolicy(): boolean {
    return (
      this.controlImplementations.get("AC.1.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkDataPrivacyPolicy(): boolean {
    return (
      this.controlImplementations.get("DP.1.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private checkCryptographicControls(): boolean {
    return (
      this.controlImplementations.get("SA.3.1")?.implementationStatus ===
      "Implemented"
    );
  }

  private calculateSectionScore(result: {
    score: number;
    violations: ADHICSViolation[];
  }): number {
    return result.score;
  }

  private determineComplianceLevel(
    score: number,
  ): "Excellent" | "Good" | "Acceptable" | "Needs Improvement" {
    if (score >= 95) return "Excellent";
    if (score >= 85) return "Good";
    if (score >= 75) return "Acceptable";
    return "Needs Improvement";
  }

  private generateRecommendations(
    violations: ADHICSViolation[],
    overallScore: number,
  ): string[] {
    const recommendations: string[] = [];

    if (violations.filter((v) => v.severity === "Critical").length > 0) {
      recommendations.push(
        "Address all critical violations immediately to ensure compliance",
      );
    }

    if (overallScore < 85) {
      recommendations.push(
        "Implement a comprehensive compliance improvement plan",
      );
    }

    if (
      violations.filter((v) => v.section === "A").length >
      violations.filter((v) => v.section === "B").length
    ) {
      recommendations.push(
        "Focus on governance and framework improvements (Section A)",
      );
    } else {
      recommendations.push(
        "Focus on technical control implementations (Section B)",
      );
    }

    recommendations.push(
      "Schedule regular compliance assessments every 90 days",
    );
    recommendations.push(
      "Implement continuous monitoring for critical controls",
    );

    return recommendations;
  }

  /**
   * Get current compliance status
   */
  public getComplianceStatus(): {
    lastAssessment: string | null;
    nextAssessmentDue: string;
    violationsCount: number;
    criticalViolationsCount: number;
  } {
    const criticalViolations = this.violations.filter(
      (v) => v.severity === "Critical",
    ).length;

    return {
      lastAssessment: this.lastAssessment?.toISOString() || null,
      nextAssessmentDue: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      violationsCount: this.violations.length,
      criticalViolationsCount: criticalViolations,
    };
  }

  /**
   * Update control implementation status
   */
  public updateControlImplementation(
    controlId: string,
    updates: Partial<ADHICSControlImplementation>,
  ): void {
    const existing = this.controlImplementations.get(controlId);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        lastReviewed: new Date().toISOString(),
      };
      this.controlImplementations.set(controlId, updated);

      // Log the update
      AuditLogger.logSecurityEvent({
        type: "compliance_violation",
        details: {
          action: "control_implementation_updated",
          controlId,
          previousStatus: existing.implementationStatus,
          newStatus: updates.implementationStatus,
          updatedBy: updates.reviewedBy || "System",
        },
        severity: "low",
        complianceImpact: true,
      });
    }
  }

  /**
   * Get all control implementations
   */
  public getAllControlImplementations(): ADHICSControlImplementation[] {
    return Array.from(this.controlImplementations.values());
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(): Promise<{
    reportId: string;
    generatedAt: string;
    assessment: ADHICSComplianceResult;
    controlImplementations: ADHICSControlImplementation[];
    executiveSummary: string;
  }> {
    const assessment = await this.performComplianceAssessment();
    const controlImplementations = this.getAllControlImplementations();

    const executiveSummary = `
ADHICS V2 Compliance Assessment Summary

Overall Compliance Score: ${assessment.overallScore}%
Compliance Level: ${assessment.complianceLevel}
Certification Status: ${assessment.certificationStatus}

Section A (Governance): ${assessment.sectionAScore}%
Section B (Controls): ${assessment.sectionBScore}%

Total Violations: ${assessment.violations.length}
Critical Violations: ${assessment.violations.filter((v) => v.severity === "Critical").length}
High Violations: ${assessment.violations.filter((v) => v.severity === "High").length}

Next Assessment Due: ${assessment.nextAssessmentDue}

Key Recommendations:
${assessment.recommendations.map((r) => `• ${r}`).join("\n")}
    `.trim();

    return {
      reportId: `ADHICS-RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      assessment,
      controlImplementations,
      executiveSummary,
    };
  }
}

export const adhicsComplianceService = ADHICSComplianceService.getInstance();
export default ADHICSComplianceService;
