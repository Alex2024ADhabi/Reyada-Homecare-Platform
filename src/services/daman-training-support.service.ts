/**
 * Daman Training Support Service
 * Comprehensive training and guidance system for Daman compliance
 */

export interface ContextualHelp {
  title: string;
  content: string;
  examples: string[];
  commonMistakes: string[];
  smartSuggestions: string[];
  complianceUpdates: string[];
}

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "error" | "success";
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  sections: Array<{
    title: string;
    content: string;
    duration: number;
  }>;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  lastUpdated: string;
  estimatedReadTime: number;
}

export interface UserProgress {
  [moduleId: string]: {
    completed: boolean;
    timeSpent: number;
    completedSections: string[];
    lastAccessed: string;
    score?: number;
  };
}

export interface UpdateNotification {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  effectiveDate: string;
  category: string;
}

export interface BestPractices {
  title: string;
  practices: Array<{
    practice: string;
    description: string;
    impact: "low" | "medium" | "high";
    difficulty: "easy" | "moderate" | "challenging";
  }>;
}

class DamanTrainingSupportService {
  private static instance: DamanTrainingSupportService;
  private contextualHelpData: Map<string, ContextualHelp> = new Map();
  private trainingModules: TrainingModule[] = [];
  private knowledgeBase: KnowledgeBaseArticle[] = [];
  private userProgress: Map<string, UserProgress> = new Map();
  private updateNotifications: UpdateNotification[] = [];
  private bestPracticesData: Map<string, BestPractices> = new Map();

  private constructor() {
    this.initializeTrainingData();
  }

  public static getInstance(): DamanTrainingSupportService {
    if (!DamanTrainingSupportService.instance) {
      DamanTrainingSupportService.instance = new DamanTrainingSupportService();
    }
    return DamanTrainingSupportService.instance;
  }

  private initializeTrainingData(): void {
    this.initializeContextualHelp();
    this.initializeTrainingModules();
    this.initializeKnowledgeBase();
    this.initializeUpdateNotifications();
    this.initializeBestPractices();
  }

  private initializeContextualHelp(): void {
    // Clinical Justification Help
    this.contextualHelpData.set("clinicalJustification", {
      title: "Clinical Justification Guidelines",
      content:
        "Provide a comprehensive medical justification that clearly explains the medical necessity for the requested service. Include patient's current condition, functional limitations, and how the service will improve their health outcomes.",
      examples: [
        "Patient has post-stroke hemiplegia requiring intensive physiotherapy to regain mobility and prevent contractures",
        "Diabetic patient with foot ulcer needs specialized wound care nursing to prevent infection and promote healing",
        "Elderly patient with multiple comorbidities requires home nursing for medication management and vital signs monitoring",
      ],
      commonMistakes: [
        "Using generic or template language without patient-specific details",
        "Failing to explain why the service cannot be provided in an outpatient setting",
        "Not mentioning specific functional goals or expected outcomes",
        "Omitting relevant medical history or current medications",
      ],
      smartSuggestions: [
        "Include specific functional assessment scores (e.g., Barthel Index, FIM scores)",
        "Mention any safety concerns that necessitate home-based care",
        "Reference relevant clinical guidelines or protocols",
        "Specify the frequency and duration of services needed",
      ],
      complianceUpdates: [
        "New requirement: Include patient's mobility status using standardized assessment tools (effective Jan 2025)",
        "Updated: Clinical justification must now specify expected outcomes within 30, 60, and 90 days",
      ],
    });

    // Service Type Help
    this.contextualHelpData.set("serviceType", {
      title: "Service Type Selection",
      content:
        "Select the most appropriate service type based on the patient's primary care needs. Each service type has specific requirements and approval criteria.",
      examples: [
        "Home Nursing: For patients requiring skilled nursing interventions",
        "Physiotherapy: For patients with mobility or movement disorders",
        "Occupational Therapy: For patients needing assistance with daily living activities",
        "Speech Therapy: For patients with communication or swallowing disorders",
      ],
      commonMistakes: [
        "Selecting multiple service types when one primary service is more appropriate",
        "Choosing service type that doesn't match the clinical justification",
        "Not considering the most cost-effective service option",
      ],
      smartSuggestions: [
        "Review Daman's service hierarchy to select the most appropriate level of care",
        "Consider combination services only when medically necessary",
        "Ensure service type aligns with patient's primary diagnosis",
      ],
      complianceUpdates: [
        "New service codes introduced for telehealth services (effective March 2025)",
        "Updated approval criteria for high-intensity services",
      ],
    });

    // Provider ID Help
    this.contextualHelpData.set("providerId", {
      title: "Provider Identification",
      content:
        "Enter your valid Daman provider ID. This must match your registered provider credentials and be in good standing with Daman.",
      examples: [
        "Format: PRV-XXXX-YYYY where XXXX is your facility code and YYYY is your specialty code",
        "Example: PRV-1234-5678 for a home healthcare facility",
      ],
      commonMistakes: [
        "Using expired or suspended provider IDs",
        "Entering provider ID with incorrect format",
        "Using individual practitioner ID instead of facility ID",
      ],
      smartSuggestions: [
        "Verify your provider status is active before submitting",
        "Ensure your provider credentials are up to date",
        "Use facility-level provider ID for institutional services",
      ],
      complianceUpdates: [
        "Provider revalidation required every 3 years (new requirement)",
        "Enhanced verification process for new providers starting 2025",
      ],
    });
  }

  private initializeTrainingModules(): void {
    this.trainingModules = [
      {
        id: "daman-basics",
        title: "Daman Authorization Basics",
        description:
          "Learn the fundamentals of Daman authorization process and requirements",
        duration: 45,
        difficulty: "beginner",
        sections: [
          {
            title: "Introduction to Daman",
            content:
              "Overview of Daman insurance and authorization requirements for healthcare providers.",
            duration: 10,
          },
          {
            title: "Authorization Process",
            content:
              "Step-by-step guide through the authorization submission process.",
            duration: 15,
          },
          {
            title: "Required Documentation",
            content:
              "Understanding what documents are needed for successful authorization.",
            duration: 10,
          },
          {
            title: "Common Pitfalls",
            content: "Learn about common mistakes and how to avoid them.",
            duration: 10,
          },
        ],
        prerequisites: [],
        learningObjectives: [
          "Understand Daman authorization requirements",
          "Navigate the submission process efficiently",
          "Identify required documentation",
          "Avoid common submission errors",
        ],
      },
      {
        id: "clinical-documentation",
        title: "Clinical Documentation Excellence",
        description:
          "Master the art of writing compelling clinical justifications",
        duration: 60,
        difficulty: "intermediate",
        sections: [
          {
            title: "Medical Necessity Criteria",
            content:
              "Understanding what constitutes medical necessity in Daman's framework.",
            duration: 15,
          },
          {
            title: "Writing Effective Justifications",
            content:
              "Techniques for crafting clear, compelling clinical justifications.",
            duration: 20,
          },
          {
            title: "Supporting Evidence",
            content: "How to gather and present supporting clinical evidence.",
            duration: 15,
          },
          {
            title: "Review and Quality Check",
            content:
              "Self-assessment techniques to ensure documentation quality.",
            duration: 10,
          },
        ],
        prerequisites: ["daman-basics"],
        learningObjectives: [
          "Write compelling clinical justifications",
          "Gather appropriate supporting evidence",
          "Meet Daman's medical necessity criteria",
          "Perform quality checks on documentation",
        ],
      },
      {
        id: "advanced-compliance",
        title: "Advanced Compliance Strategies",
        description:
          "Advanced techniques for maintaining high approval rates and compliance",
        duration: 90,
        difficulty: "advanced",
        sections: [
          {
            title: "Regulatory Updates",
            content:
              "Stay current with the latest Daman policy changes and requirements.",
            duration: 20,
          },
          {
            title: "Denial Management",
            content: "Strategies for handling denials and successful appeals.",
            duration: 25,
          },
          {
            title: "Quality Metrics",
            content:
              "Understanding and improving your authorization success metrics.",
            duration: 25,
          },
          {
            title: "Best Practices",
            content:
              "Industry best practices for maintaining high compliance rates.",
            duration: 20,
          },
        ],
        prerequisites: ["daman-basics", "clinical-documentation"],
        learningObjectives: [
          "Stay compliant with latest regulations",
          "Effectively manage denials and appeals",
          "Monitor and improve quality metrics",
          "Implement industry best practices",
        ],
      },
    ];
  }

  private initializeKnowledgeBase(): void {
    this.knowledgeBase = [
      {
        id: "kb-001",
        title: "Daman 2025 Policy Updates",
        content:
          "Comprehensive guide to the new Daman policies effective January 2025, including updated service codes, authorization requirements, and payment terms.",
        category: "Policy Updates",
        difficulty: "intermediate",
        tags: ["policy", "2025", "updates", "requirements"],
        lastUpdated: "2024-12-01",
        estimatedReadTime: 8,
      },
      {
        id: "kb-002",
        title: "Clinical Justification Templates",
        content:
          "Ready-to-use templates for common clinical scenarios including post-surgical care, chronic disease management, and rehabilitation services.",
        category: "Templates",
        difficulty: "beginner",
        tags: ["templates", "clinical", "justification", "examples"],
        lastUpdated: "2024-11-15",
        estimatedReadTime: 5,
      },
      {
        id: "kb-003",
        title: "Wheelchair Pre-approval Process",
        content:
          "Step-by-step guide for the new wheelchair pre-approval form required starting May 1, 2025, including required assessments and documentation.",
        category: "Procedures",
        difficulty: "intermediate",
        tags: ["wheelchair", "pre-approval", "DME", "assessment"],
        lastUpdated: "2024-12-10",
        estimatedReadTime: 6,
      },
      {
        id: "kb-004",
        title: "Common Denial Reasons and Solutions",
        content:
          "Analysis of the most frequent denial reasons and proven strategies to address them in future submissions.",
        category: "Troubleshooting",
        difficulty: "intermediate",
        tags: ["denials", "troubleshooting", "solutions", "appeals"],
        lastUpdated: "2024-11-30",
        estimatedReadTime: 7,
      },
      {
        id: "kb-005",
        title: "Service Code Quick Reference",
        content:
          "Complete reference guide for all Daman service codes including new codes introduced in 2025 and deprecated codes to avoid.",
        category: "Reference",
        difficulty: "beginner",
        tags: ["service codes", "reference", "billing", "codes"],
        lastUpdated: "2024-12-05",
        estimatedReadTime: 4,
      },
    ];
  }

  private initializeUpdateNotifications(): void {
    this.updateNotifications = [
      {
        id: "update-001",
        title: "Wheelchair Pre-approval Mandatory",
        description:
          "Starting May 1, 2025, all wheelchair and mobility equipment requests must include a completed pre-approval form with functional assessment.",
        priority: "critical",
        effectiveDate: "2025-05-01",
        category: "Policy Change",
      },
      {
        id: "update-002",
        title: "New Service Codes for Telehealth",
        description:
          "New service codes 17-27-1 through 17-27-5 introduced for telehealth services. Update your billing systems accordingly.",
        priority: "high",
        effectiveDate: "2025-03-01",
        category: "Service Codes",
      },
      {
        id: "update-003",
        title: "Enhanced Clinical Documentation Requirements",
        description:
          "Clinical justifications must now include specific functional outcomes and measurable goals. Minimum length increased to 150 characters.",
        priority: "high",
        effectiveDate: "2025-01-15",
        category: "Documentation",
      },
      {
        id: "update-004",
        title: "Provider Revalidation Cycle",
        description:
          "All providers must complete revalidation every 3 years. Check your revalidation date in the provider portal.",
        priority: "medium",
        effectiveDate: "2025-01-01",
        category: "Provider Requirements",
      },
    ];
  }

  private initializeBestPractices(): void {
    this.bestPracticesData.set("submission", {
      title: "Authorization Submission Best Practices",
      practices: [
        {
          practice: "Submit during business hours (8 AM - 5 PM)",
          description:
            "Submissions during business hours are processed faster and have higher approval rates due to immediate review availability.",
          impact: "medium",
          difficulty: "easy",
        },
        {
          practice: "Include comprehensive clinical assessments",
          description:
            "Attach standardized assessment tools (Barthel Index, FIM scores) to strengthen your clinical justification.",
          impact: "high",
          difficulty: "moderate",
        },
        {
          practice: "Use patient-specific language",
          description:
            "Avoid generic templates and include specific details about the patient's condition, limitations, and care needs.",
          impact: "high",
          difficulty: "moderate",
        },
        {
          practice: "Verify provider credentials before submission",
          description:
            "Ensure your provider ID is active and credentials are current to avoid automatic rejections.",
          impact: "high",
          difficulty: "easy",
        },
        {
          practice: "Follow up on pending authorizations",
          description:
            "Monitor submission status and follow up proactively to prevent delays and ensure timely processing.",
          impact: "medium",
          difficulty: "easy",
        },
      ],
    });
  }

  /**
   * Get contextual help for a specific field
   */
  public getContextualHelp(fieldName: string): ContextualHelp | null {
    return this.contextualHelpData.get(fieldName) || null;
  }

  /**
   * Generate step-by-step submission guidance
   */
  public generateSubmissionGuidance(
    formData: any,
    userLevel: "beginner" | "intermediate" | "advanced",
  ): GuidanceStep[] {
    const steps: GuidanceStep[] = [];

    // Step 1: Patient Information
    steps.push({
      id: "patient-info",
      title: "Complete Patient Information",
      description:
        "Ensure all required patient details are accurate and complete, including Emirates ID and insurance information.",
      type: formData.patientId ? "success" : "error",
      estimatedTime: "2-3 minutes",
      difficulty: "beginner",
      prerequisites: ["Valid patient registration", "Insurance verification"],
    });

    // Step 2: Service Selection
    steps.push({
      id: "service-selection",
      title: "Select Appropriate Service Type",
      description:
        "Choose the service type that best matches the patient's primary care needs and clinical condition.",
      type: formData.serviceType ? "success" : "warning",
      estimatedTime: "1-2 minutes",
      difficulty: "beginner",
      prerequisites: ["Understanding of service types", "Clinical assessment"],
    });

    // Step 3: Clinical Justification
    const justificationLength = (formData.clinicalJustification || "").length;
    steps.push({
      id: "clinical-justification",
      title: "Write Comprehensive Clinical Justification",
      description:
        "Provide detailed medical necessity explanation with specific patient conditions and expected outcomes.",
      type:
        justificationLength >= 150
          ? "success"
          : justificationLength >= 100
            ? "warning"
            : "error",
      estimatedTime: "5-10 minutes",
      difficulty: userLevel === "beginner" ? "intermediate" : "beginner",
      prerequisites: ["Clinical assessment", "Medical records review"],
    });

    // Step 4: Supporting Documentation
    const documentsCount = (formData.documents || []).length;
    steps.push({
      id: "supporting-docs",
      title: "Attach Supporting Documents",
      description:
        "Include all relevant medical reports, assessments, and clinical evidence to support your request.",
      type:
        documentsCount >= 3
          ? "success"
          : documentsCount >= 1
            ? "warning"
            : "error",
      estimatedTime: "3-5 minutes",
      difficulty: "beginner",
      prerequisites: ["Medical records", "Assessment reports"],
    });

    // Step 5: Quality Review
    steps.push({
      id: "quality-review",
      title: "Perform Quality Review",
      description:
        "Review all information for accuracy, completeness, and compliance with Daman requirements.",
      type: "info",
      estimatedTime: "2-3 minutes",
      difficulty: "intermediate",
      prerequisites: ["Completed form", "All supporting documents"],
    });

    return steps;
  }

  /**
   * Search knowledge base
   */
  public searchKnowledgeBase(query: string): KnowledgeBaseArticle[] {
    if (!query.trim()) {
      return this.knowledgeBase.slice(0, 10); // Return first 10 articles
    }

    const searchTerms = query.toLowerCase().split(" ");
    return this.knowledgeBase
      .filter((article) => {
        const searchableText =
          `${article.title} ${article.content} ${article.tags.join(" ")}`.toLowerCase();
        return searchTerms.some((term) => searchableText.includes(term));
      })
      .sort((a, b) => {
        // Sort by relevance (simple scoring based on title matches)
        const aScore = searchTerms.reduce(
          (score, term) =>
            score +
            (a.title.toLowerCase().includes(term) ? 2 : 0) +
            (a.content.toLowerCase().includes(term) ? 1 : 0),
          0,
        );
        const bScore = searchTerms.reduce(
          (score, term) =>
            score +
            (b.title.toLowerCase().includes(term) ? 2 : 0) +
            (b.content.toLowerCase().includes(term) ? 1 : 0),
          0,
        );
        return bScore - aScore;
      });
  }

  /**
   * Get training modules
   */
  public getTrainingModules(): TrainingModule[] {
    return this.trainingModules;
  }

  /**
   * Get user progress
   */
  public getUserProgress(userId: string): UserProgress {
    return this.userProgress.get(userId) || {};
  }

  /**
   * Track user progress
   */
  public trackProgress(
    userId: string,
    moduleId: string,
    progress: Partial<UserProgress[string]>,
  ): void {
    const userProgress = this.userProgress.get(userId) || {};
    userProgress[moduleId] = {
      ...userProgress[moduleId],
      ...progress,
      lastAccessed: new Date().toISOString(),
    };
    this.userProgress.set(userId, userProgress);
  }

  /**
   * Get update notifications
   */
  public getUpdateNotifications(): UpdateNotification[] {
    return this.updateNotifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get best practices
   */
  public getBestPractices(category: string): BestPractices | null {
    return this.bestPracticesData.get(category) || null;
  }

  /**
   * Get error resolution help
   */
  public getErrorResolutionHelp(errorType: string, errorMessage: string): any {
    const commonSolutions: Record<string, any> = {
      validation_error: {
        title: "Validation Error Resolution",
        description:
          "This error occurs when required fields are missing or contain invalid data.",
        solutions: [
          "Check all required fields are completed",
          "Verify data formats (dates, IDs, etc.)",
          "Ensure text fields meet minimum length requirements",
        ],
        preventionTips: [
          "Use the built-in validation before submitting",
          "Keep a checklist of required fields",
          "Double-check data entry for accuracy",
        ],
      },
      authorization_denied: {
        title: "Authorization Denial Resolution",
        description:
          "Your authorization request was denied. Here's how to address common denial reasons.",
        solutions: [
          "Review the denial reason carefully",
          "Strengthen clinical justification with more specific details",
          "Add additional supporting documentation",
          "Consider submitting an appeal with new evidence",
        ],
        preventionTips: [
          "Use comprehensive clinical assessments",
          "Include functional outcome measures",
          "Ensure medical necessity is clearly demonstrated",
        ],
      },
      technical_error: {
        title: "Technical Error Resolution",
        description:
          "A technical issue prevented your submission from being processed.",
        solutions: [
          "Try submitting again after a few minutes",
          "Check your internet connection",
          "Clear browser cache and cookies",
          "Contact technical support if issue persists",
        ],
        preventionTips: [
          "Save your work frequently",
          "Use a stable internet connection",
          "Keep browser updated",
        ],
      },
    };

    return (
      commonSolutions[errorType] || {
        title: "General Error Resolution",
        description: "An error occurred during processing.",
        solutions: [
          "Review the error message for specific details",
          "Check all form fields for completeness and accuracy",
          "Try the operation again",
          "Contact support if the issue persists",
        ],
        preventionTips: [
          "Follow the step-by-step guidance",
          "Use the quality check features",
          "Keep your training up to date",
        ],
      }
    );
  }
}

export const damanTrainingSupport = DamanTrainingSupportService.getInstance();
export default DamanTrainingSupportService;
