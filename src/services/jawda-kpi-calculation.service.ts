import { EventEmitter } from "eventemitter3";

// JAWDA KPI Types and Interfaces
interface JAWDAKPIMetrics {
  patientSafety: {
    incidentRate: number;
    preventableEvents: number;
    safetyScore: number;
    riskAssessmentCompliance: number;
  };
  clinicalQuality: {
    outcomeScores: number;
    protocolCompliance: number;
    careCoordinationEfficiency: number;
    clinicalIndicatorPerformance: number;
  };
  patientExperience: {
    satisfactionScore: number;
    complaintResolutionTime: number;
    accessibilityRating: number;
    communicationQuality: number;
  };
  operationalEfficiency: {
    resourceUtilization: number;
    staffProductivity: number;
    costEffectiveness: number;
    processOptimization: number;
  };
  governanceCompliance: {
    regulatoryCompliance: number;
    policyAdherence: number;
    documentationQuality: number;
    auditReadiness: number;
  };
  continuousImprovement: {
    innovationIndex: number;
    qualityInitiatives: number;
    staffDevelopment: number;
    technologyAdoption: number;
  };
}

interface JAWDAKPICalculationResult {
  overallScore: number;
  categoryScores: JAWDAKPIMetrics;
  trends: {
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
  benchmarks: {
    national: number;
    regional: number;
    peerGroup: number;
  };
  recommendations: {
    priority: "high" | "medium" | "low";
    category: keyof JAWDAKPIMetrics;
    description: string;
    actionItems: string[];
    expectedImpact: number;
  }[];
  lastCalculated: string;
  nextCalculation: string;
}

interface PatientSatisfactionData {
  surveyId: string;
  patientId: string;
  serviceDate: string;
  ratings: {
    overallSatisfaction: number;
    careQuality: number;
    staffProfessionalism: number;
    communication: number;
    timeliness: number;
    facilityRating: number;
  };
  feedback: string;
  recommendationLikelihood: number;
  submissionDate: string;
}

interface QualityImprovementWorkflow {
  workflowId: string;
  category: keyof JAWDAKPIMetrics;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  currentKPI: number;
  targetKPI: number;
  timeline: string;
  assignedTeam: string[];
  milestones: {
    id: string;
    description: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    completionDate?: string;
  }[];
  status: "active" | "completed" | "paused" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

class JAWDAKPICalculationService extends EventEmitter {
  private calculationInterval: NodeJS.Timeout | null = null;
  private isCalculating = false;
  private lastCalculationResult: JAWDAKPICalculationResult | null = null;
  private patientSatisfactionData: PatientSatisfactionData[] = [];
  private qualityWorkflows: QualityImprovementWorkflow[] = [];

  constructor() {
    super();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      console.log("🎯 Initializing JAWDA KPI Calculation Service...");

      // Load historical data
      await this.loadHistoricalData();

      // Start real-time calculation
      this.startRealTimeCalculation();

      // Initialize patient satisfaction tracking
      this.initializePatientSatisfactionTracking();

      // Setup quality improvement workflows
      this.initializeQualityWorkflows();

      console.log("✅ JAWDA KPI Calculation Service initialized successfully");
      this.emit("service:initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize JAWDA KPI Calculation Service:",
        error,
      );
      this.emit("service:error", error);
    }
  }

  private async loadHistoricalData(): Promise<void> {
    // Simulate loading historical KPI data
    console.log("📊 Loading historical JAWDA KPI data...");

    // In production, this would load from database
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate sample historical data
    this.generateSampleHistoricalData();
  }

  private generateSampleHistoricalData(): void {
    // Generate sample patient satisfaction data
    for (let i = 0; i < 50; i++) {
      this.patientSatisfactionData.push({
        surveyId: `SURVEY-${Date.now()}-${i}`,
        patientId: `PAT-${1000 + i}`,
        serviceDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        ratings: {
          overallSatisfaction: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3-5 range
          careQuality: Math.round((Math.random() * 2 + 3) * 10) / 10,
          staffProfessionalism: Math.round((Math.random() * 2 + 3) * 10) / 10,
          communication: Math.round((Math.random() * 2 + 3) * 10) / 10,
          timeliness: Math.round((Math.random() * 2 + 3) * 10) / 10,
          facilityRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        },
        feedback: `Patient feedback for survey ${i + 1}`,
        recommendationLikelihood: Math.round(Math.random() * 10),
        submissionDate: new Date().toISOString(),
      });
    }
  }

  private startRealTimeCalculation(): void {
    // Calculate KPIs every 5 minutes
    this.calculationInterval = setInterval(
      async () => {
        await this.calculateJAWDAKPIs();
      },
      5 * 60 * 1000,
    );

    // Initial calculation
    this.calculateJAWDAKPIs();
  }

  public async calculateJAWDAKPIs(): Promise<JAWDAKPICalculationResult> {
    if (this.isCalculating) {
      console.log("⏳ KPI calculation already in progress...");
      return this.lastCalculationResult!;
    }

    this.isCalculating = true;
    console.log("🔄 Starting JAWDA KPI calculation...");

    try {
      // Calculate each category
      const patientSafety = await this.calculatePatientSafetyKPIs();
      const clinicalQuality = await this.calculateClinicalQualityKPIs();
      const patientExperience = await this.calculatePatientExperienceKPIs();
      const operationalEfficiency =
        await this.calculateOperationalEfficiencyKPIs();
      const governanceCompliance =
        await this.calculateGovernanceComplianceKPIs();
      const continuousImprovement =
        await this.calculateContinuousImprovementKPIs();

      const categoryScores: JAWDAKPIMetrics = {
        patientSafety,
        clinicalQuality,
        patientExperience,
        operationalEfficiency,
        governanceCompliance,
        continuousImprovement,
      };

      // Calculate overall score
      const overallScore = this.calculateOverallScore(categoryScores);

      // Generate trends
      const trends = this.generateTrends();

      // Get benchmarks
      const benchmarks = this.getBenchmarks();

      // Generate recommendations
      const recommendations = this.generateRecommendations(categoryScores);

      const result: JAWDAKPICalculationResult = {
        overallScore,
        categoryScores,
        trends,
        benchmarks,
        recommendations,
        lastCalculated: new Date().toISOString(),
        nextCalculation: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };

      this.lastCalculationResult = result;
      this.emit("kpi:calculated", result);

      console.log(
        `✅ JAWDA KPI calculation completed. Overall Score: ${overallScore.toFixed(1)}%`,
      );

      return result;
    } catch (error) {
      console.error("❌ Error calculating JAWDA KPIs:", error);
      this.emit("kpi:error", error);
      throw error;
    } finally {
      this.isCalculating = false;
    }
  }

  private async calculatePatientSafetyKPIs(): Promise<
    JAWDAKPIMetrics["patientSafety"]
  > {
    // Simulate patient safety calculations
    return {
      incidentRate: Math.round((Math.random() * 5 + 92) * 10) / 10, // 92-97%
      preventableEvents: Math.round((Math.random() * 8 + 88) * 10) / 10, // 88-96%
      safetyScore: Math.round((Math.random() * 6 + 90) * 10) / 10, // 90-96%
      riskAssessmentCompliance: Math.round((Math.random() * 4 + 94) * 10) / 10, // 94-98%
    };
  }

  private async calculateClinicalQualityKPIs(): Promise<
    JAWDAKPIMetrics["clinicalQuality"]
  > {
    return {
      outcomeScores: Math.round((Math.random() * 6 + 89) * 10) / 10, // 89-95%
      protocolCompliance: Math.round((Math.random() * 5 + 91) * 10) / 10, // 91-96%
      careCoordinationEfficiency:
        Math.round((Math.random() * 7 + 87) * 10) / 10, // 87-94%
      clinicalIndicatorPerformance:
        Math.round((Math.random() * 4 + 92) * 10) / 10, // 92-96%
    };
  }

  private async calculatePatientExperienceKPIs(): Promise<
    JAWDAKPIMetrics["patientExperience"]
  > {
    // Calculate based on actual patient satisfaction data
    const avgSatisfaction =
      this.patientSatisfactionData.reduce(
        (sum, data) => sum + data.ratings.overallSatisfaction,
        0,
      ) / this.patientSatisfactionData.length;

    const avgCommunication =
      this.patientSatisfactionData.reduce(
        (sum, data) => sum + data.ratings.communication,
        0,
      ) / this.patientSatisfactionData.length;

    return {
      satisfactionScore: Math.round(avgSatisfaction * 20 * 10) / 10, // Convert 5-point to 100-point scale
      complaintResolutionTime: Math.round((Math.random() * 10 + 85) * 10) / 10, // 85-95%
      accessibilityRating: Math.round((Math.random() * 8 + 88) * 10) / 10, // 88-96%
      communicationQuality: Math.round(avgCommunication * 20 * 10) / 10, // Convert 5-point to 100-point scale
    };
  }

  private async calculateOperationalEfficiencyKPIs(): Promise<
    JAWDAKPIMetrics["operationalEfficiency"]
  > {
    return {
      resourceUtilization: Math.round((Math.random() * 8 + 86) * 10) / 10, // 86-94%
      staffProductivity: Math.round((Math.random() * 6 + 89) * 10) / 10, // 89-95%
      costEffectiveness: Math.round((Math.random() * 7 + 87) * 10) / 10, // 87-94%
      processOptimization: Math.round((Math.random() * 5 + 90) * 10) / 10, // 90-95%
    };
  }

  private async calculateGovernanceComplianceKPIs(): Promise<
    JAWDAKPIMetrics["governanceCompliance"]
  > {
    return {
      regulatoryCompliance: Math.round((Math.random() * 3 + 95) * 10) / 10, // 95-98%
      policyAdherence: Math.round((Math.random() * 4 + 93) * 10) / 10, // 93-97%
      documentationQuality: Math.round((Math.random() * 5 + 91) * 10) / 10, // 91-96%
      auditReadiness: Math.round((Math.random() * 4 + 94) * 10) / 10, // 94-98%
    };
  }

  private async calculateContinuousImprovementKPIs(): Promise<
    JAWDAKPIMetrics["continuousImprovement"]
  > {
    return {
      innovationIndex: Math.round((Math.random() * 10 + 82) * 10) / 10, // 82-92%
      qualityInitiatives: Math.round((Math.random() * 8 + 85) * 10) / 10, // 85-93%
      staffDevelopment: Math.round((Math.random() * 7 + 87) * 10) / 10, // 87-94%
      technologyAdoption: Math.round((Math.random() * 9 + 84) * 10) / 10, // 84-93%
    };
  }

  private calculateOverallScore(categoryScores: JAWDAKPIMetrics): number {
    const weights = {
      patientSafety: 0.25,
      clinicalQuality: 0.2,
      patientExperience: 0.2,
      operationalEfficiency: 0.15,
      governanceCompliance: 0.15,
      continuousImprovement: 0.05,
    };

    let totalScore = 0;

    Object.entries(categoryScores).forEach(([category, scores]) => {
      const categoryAvg =
        Object.values(scores).reduce((sum, score) => sum + score, 0) /
        Object.values(scores).length;
      totalScore += categoryAvg * weights[category as keyof typeof weights];
    });

    return Math.round(totalScore * 10) / 10;
  }

  private generateTrends(): JAWDAKPICalculationResult["trends"] {
    return {
      monthly: Array.from(
        { length: 12 },
        () => Math.round((Math.random() * 10 + 85) * 10) / 10,
      ),
      quarterly: Array.from(
        { length: 4 },
        () => Math.round((Math.random() * 8 + 87) * 10) / 10,
      ),
      yearly: Array.from(
        { length: 3 },
        () => Math.round((Math.random() * 6 + 89) * 10) / 10,
      ),
    };
  }

  private getBenchmarks(): JAWDAKPICalculationResult["benchmarks"] {
    return {
      national: Math.round((Math.random() * 5 + 88) * 10) / 10,
      regional: Math.round((Math.random() * 6 + 90) * 10) / 10,
      peerGroup: Math.round((Math.random() * 4 + 91) * 10) / 10,
    };
  }

  private generateRecommendations(
    categoryScores: JAWDAKPIMetrics,
  ): JAWDAKPICalculationResult["recommendations"] {
    const recommendations: JAWDAKPICalculationResult["recommendations"] = [];

    // Analyze each category and generate recommendations
    Object.entries(categoryScores).forEach(([category, scores]) => {
      const avgScore =
        Object.values(scores).reduce((sum, score) => sum + score, 0) /
        Object.values(scores).length;

      if (avgScore < 90) {
        recommendations.push({
          priority: avgScore < 85 ? "high" : "medium",
          category: category as keyof JAWDAKPIMetrics,
          description: `Improve ${category.replace(/([A-Z])/g, " $1").toLowerCase()} performance`,
          actionItems: this.getActionItemsForCategory(
            category as keyof JAWDAKPIMetrics,
          ),
          expectedImpact: Math.round((95 - avgScore) * 10) / 10,
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private getActionItemsForCategory(category: keyof JAWDAKPIMetrics): string[] {
    const actionItems = {
      patientSafety: [
        "Implement additional safety protocols",
        "Enhance staff training on safety procedures",
        "Improve incident reporting systems",
        "Conduct regular safety audits",
      ],
      clinicalQuality: [
        "Review and update clinical protocols",
        "Implement evidence-based practices",
        "Enhance care coordination processes",
        "Improve clinical documentation",
      ],
      patientExperience: [
        "Implement patient feedback systems",
        "Enhance communication training",
        "Improve service accessibility",
        "Reduce waiting times",
      ],
      operationalEfficiency: [
        "Optimize resource allocation",
        "Implement process automation",
        "Enhance staff productivity measures",
        "Improve cost management",
      ],
      governanceCompliance: [
        "Update compliance procedures",
        "Enhance documentation systems",
        "Implement regular audits",
        "Improve policy adherence",
      ],
      continuousImprovement: [
        "Implement innovation programs",
        "Enhance staff development",
        "Adopt new technologies",
        "Create quality improvement initiatives",
      ],
    };

    return actionItems[category] || [];
  }

  private initializePatientSatisfactionTracking(): void {
    console.log("📋 Initializing patient satisfaction tracking...");

    // Set up automated satisfaction survey triggers
    this.setupSatisfactionSurveyTriggers();

    // Initialize satisfaction analytics
    this.initializeSatisfactionAnalytics();
  }

  private setupSatisfactionSurveyTriggers(): void {
    // Simulate survey triggers after service completion
    setInterval(
      () => {
        this.triggerPatientSatisfactionSurvey();
      },
      30 * 60 * 1000,
    ); // Every 30 minutes
  }

  private triggerPatientSatisfactionSurvey(): void {
    const surveyData: PatientSatisfactionData = {
      surveyId: `SURVEY-${Date.now()}`,
      patientId: `PAT-${Math.floor(Math.random() * 9000) + 1000}`,
      serviceDate: new Date().toISOString(),
      ratings: {
        overallSatisfaction: Math.round((Math.random() * 2 + 3) * 10) / 10,
        careQuality: Math.round((Math.random() * 2 + 3) * 10) / 10,
        staffProfessionalism: Math.round((Math.random() * 2 + 3) * 10) / 10,
        communication: Math.round((Math.random() * 2 + 3) * 10) / 10,
        timeliness: Math.round((Math.random() * 2 + 3) * 10) / 10,
        facilityRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      },
      feedback: "Automated survey response",
      recommendationLikelihood: Math.round(Math.random() * 10),
      submissionDate: new Date().toISOString(),
    };

    this.patientSatisfactionData.push(surveyData);
    this.emit("satisfaction:survey-completed", surveyData);

    // Keep only last 100 surveys
    if (this.patientSatisfactionData.length > 100) {
      this.patientSatisfactionData = this.patientSatisfactionData.slice(-100);
    }
  }

  private initializeSatisfactionAnalytics(): void {
    // Set up analytics processing
    setInterval(
      () => {
        this.processSatisfactionAnalytics();
      },
      15 * 60 * 1000,
    ); // Every 15 minutes
  }

  private processSatisfactionAnalytics(): void {
    if (this.patientSatisfactionData.length === 0) return;

    const analytics = {
      averageRatings: this.calculateAverageRatings(),
      trendAnalysis: this.analyzeSatisfactionTrends(),
      alertsGenerated: this.generateSatisfactionAlerts(),
    };

    this.emit("satisfaction:analytics-updated", analytics);
  }

  private calculateAverageRatings() {
    const totals = this.patientSatisfactionData.reduce(
      (acc, data) => {
        Object.entries(data.ratings).forEach(([key, value]) => {
          acc[key] = (acc[key] || 0) + value;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const count = this.patientSatisfactionData.length;
    const averages: Record<string, number> = {};

    Object.entries(totals).forEach(([key, total]) => {
      averages[key] = Math.round((total / count) * 10) / 10;
    });

    return averages;
  }

  private analyzeSatisfactionTrends() {
    // Simple trend analysis - compare last 10 vs previous 10
    if (this.patientSatisfactionData.length < 20) return null;

    const recent = this.patientSatisfactionData.slice(-10);
    const previous = this.patientSatisfactionData.slice(-20, -10);

    const recentAvg =
      recent.reduce((sum, data) => sum + data.ratings.overallSatisfaction, 0) /
      recent.length;
    const previousAvg =
      previous.reduce(
        (sum, data) => sum + data.ratings.overallSatisfaction,
        0,
      ) / previous.length;

    return {
      trend: recentAvg > previousAvg ? "improving" : "declining",
      change: Math.round((recentAvg - previousAvg) * 100) / 100,
    };
  }

  private generateSatisfactionAlerts() {
    const alerts = [];
    const recentData = this.patientSatisfactionData.slice(-5);

    const lowRatings = recentData.filter(
      (data) => data.ratings.overallSatisfaction < 3,
    );
    if (lowRatings.length > 2) {
      alerts.push({
        type: "low_satisfaction",
        message: "Multiple low satisfaction ratings detected",
        count: lowRatings.length,
      });
    }

    return alerts;
  }

  private initializeQualityWorkflows(): void {
    console.log("🔄 Initializing quality improvement workflows...");

    // Create sample workflows
    this.createSampleQualityWorkflows();

    // Set up workflow monitoring
    this.setupWorkflowMonitoring();
  }

  private createSampleQualityWorkflows(): void {
    const sampleWorkflows: QualityImprovementWorkflow[] = [
      {
        workflowId: "QI-001",
        category: "patientSafety",
        priority: "high",
        title: "Reduce Patient Safety Incidents",
        description:
          "Implement comprehensive safety protocols to reduce incident rates",
        currentKPI: 92.5,
        targetKPI: 96.0,
        timeline: "3 months",
        assignedTeam: ["Safety Team", "Clinical Staff", "Quality Manager"],
        milestones: [
          {
            id: "MS-001",
            description: "Complete safety protocol review",
            dueDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            status: "in-progress",
          },
          {
            id: "MS-002",
            description: "Implement new safety measures",
            dueDate: new Date(
              Date.now() + 60 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            status: "pending",
          },
        ],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        workflowId: "QI-002",
        category: "patientExperience",
        priority: "medium",
        title: "Improve Patient Satisfaction Scores",
        description:
          "Enhance patient experience through better communication and service",
        currentKPI: 88.2,
        targetKPI: 92.0,
        timeline: "2 months",
        assignedTeam: ["Patient Relations", "Clinical Staff"],
        milestones: [
          {
            id: "MS-003",
            description: "Implement patient feedback system",
            dueDate: new Date(
              Date.now() + 45 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            status: "pending",
          },
        ],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.qualityWorkflows = sampleWorkflows;
  }

  private setupWorkflowMonitoring(): void {
    // Monitor workflow progress every hour
    setInterval(
      () => {
        this.monitorWorkflowProgress();
      },
      60 * 60 * 1000,
    );
  }

  private monitorWorkflowProgress(): void {
    this.qualityWorkflows.forEach((workflow) => {
      // Check for overdue milestones
      workflow.milestones.forEach((milestone) => {
        if (
          milestone.status !== "completed" &&
          new Date(milestone.dueDate) < new Date()
        ) {
          milestone.status = "overdue";
          this.emit("workflow:milestone-overdue", { workflow, milestone });
        }
      });

      // Update workflow status based on milestone completion
      const completedMilestones = workflow.milestones.filter(
        (m) => m.status === "completed",
      ).length;
      const totalMilestones = workflow.milestones.length;

      if (completedMilestones === totalMilestones) {
        workflow.status = "completed";
        this.emit("workflow:completed", workflow);
      }
    });
  }

  // Public API Methods
  public async getLatestKPIs(): Promise<JAWDAKPICalculationResult | null> {
    return this.lastCalculationResult;
  }

  public async getPatientSatisfactionData(): Promise<
    PatientSatisfactionData[]
  > {
    return [...this.patientSatisfactionData];
  }

  public async getQualityWorkflows(): Promise<QualityImprovementWorkflow[]> {
    return [...this.qualityWorkflows];
  }

  public async createQualityWorkflow(
    workflow: Omit<
      QualityImprovementWorkflow,
      "workflowId" | "createdAt" | "updatedAt"
    >,
  ): Promise<QualityImprovementWorkflow> {
    const newWorkflow: QualityImprovementWorkflow = {
      ...workflow,
      workflowId: `QI-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.qualityWorkflows.push(newWorkflow);
    this.emit("workflow:created", newWorkflow);

    return newWorkflow;
  }

  public async updateWorkflowMilestone(
    workflowId: string,
    milestoneId: string,
    status: QualityImprovementWorkflow["milestones"][0]["status"],
  ): Promise<void> {
    const workflow = this.qualityWorkflows.find(
      (w) => w.workflowId === workflowId,
    );
    if (!workflow) throw new Error("Workflow not found");

    const milestone = workflow.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    milestone.status = status;
    if (status === "completed") {
      milestone.completionDate = new Date().toISOString();
    }

    workflow.updatedAt = new Date().toISOString();
    this.emit("workflow:milestone-updated", { workflow, milestone });
  }

  public async generateKPIReport(
    format: "json" | "pdf" | "excel" = "json",
  ): Promise<any> {
    const kpis = await this.getLatestKPIs();
    if (!kpis) throw new Error("No KPI data available");

    const report = {
      generatedAt: new Date().toISOString(),
      reportType: "JAWDA KPI Report",
      format,
      data: kpis,
      summary: {
        overallPerformance:
          kpis.overallScore >= 90
            ? "Excellent"
            : kpis.overallScore >= 80
              ? "Good"
              : "Needs Improvement",
        topPerformingCategory: this.getTopPerformingCategory(
          kpis.categoryScores,
        ),
        areasForImprovement: kpis.recommendations.filter(
          (r) => r.priority === "high",
        ).length,
      },
    };

    this.emit("report:generated", report);
    return report;
  }

  private getTopPerformingCategory(categoryScores: JAWDAKPIMetrics): string {
    let topCategory = "";
    let topScore = 0;

    Object.entries(categoryScores).forEach(([category, scores]) => {
      const avgScore =
        Object.values(scores).reduce((sum, score) => sum + score, 0) /
        Object.values(scores).length;
      if (avgScore > topScore) {
        topScore = avgScore;
        topCategory = category;
      }
    });

    return topCategory.replace(/([A-Z])/g, " $1").toLowerCase();
  }

  public async getDashboardIntegrationData(): Promise<any> {
    const kpis = await this.getLatestKPIs();
    const satisfaction = await this.getPatientSatisfactionData();
    const workflows = await this.getQualityWorkflows();

    return {
      kpis,
      satisfaction: {
        totalSurveys: satisfaction.length,
        averageRating:
          satisfaction.reduce(
            (sum, s) => sum + s.ratings.overallSatisfaction,
            0,
          ) / satisfaction.length,
        recentTrend: this.analyzeSatisfactionTrends(),
      },
      workflows: {
        total: workflows.length,
        active: workflows.filter((w) => w.status === "active").length,
        completed: workflows.filter((w) => w.status === "completed").length,
        overdue: workflows.filter((w) =>
          w.milestones.some((m) => m.status === "overdue"),
        ).length,
      },
      alerts: this.generateSatisfactionAlerts(),
    };
  }

  public destroy(): void {
    if (this.calculationInterval) {
      clearInterval(this.calculationInterval);
    }
    this.removeAllListeners();
    console.log("🔄 JAWDA KPI Calculation Service destroyed");
  }
}

// Export singleton instance
export const jawdaKPICalculationService = new JAWDAKPICalculationService();
export default jawdaKPICalculationService;

// Export types for use in other components
export type {
  JAWDAKPIMetrics,
  JAWDAKPICalculationResult,
  PatientSatisfactionData,
  QualityImprovementWorkflow,
};
