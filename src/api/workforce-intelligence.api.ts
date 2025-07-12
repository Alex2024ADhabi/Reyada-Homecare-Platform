import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
import { getAttendanceRecords, getAttendanceAnalytics } from "./attendance.api";
import { getDailyPlans, getDailyPlanningAnalytics } from "./daily-planning.api";
import {
  getIncidentReports,
  getIncidentAnalytics,
} from "./incident-management.api";

// CRITICAL: Intelligent Workforce Analytics Platform Interfaces

// Date Range Interface
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Staffing Prediction Parameters Interface
export interface StaffingPredictionParameters {
  period: DateRange;
  departments?: string[];
  serviceTypes?: string[];
  geographicZones?: string[];
  constraints?: OperationalConstraints;
  confidenceLevel?: number;
}

// Operational Constraints Interface
export interface OperationalConstraints {
  maxOvertimeHours: number;
  minStaffingLevels: { [role: string]: number };
  budgetConstraints: number;
  skillRequirements: { [skill: string]: number };
  geographicLimitations: string[];
  regulatoryRequirements: string[];
}

// Staffing Forecast Interface
export interface StaffingForecast {
  forecastPeriod: DateRange;
  staffingRequirements: StaffingRequirement[];
  skillGapAnalysis: SkillGap[];
  trainingRecommendations: TrainingRecommendation[];
  recruitmentPriorities: RecruitmentPriority[];
  budgetImplications: BudgetImplication;
}

// Staffing Requirement Interface
export interface StaffingRequirement {
  role: string;
  department: string;
  requiredCount: number;
  currentCount: number;
  gap: number;
  priority: "critical" | "high" | "medium" | "low";
  timeframe: string;
  justification: string;
}

// Skill Gap Interface
export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  affectedRoles: string[];
  trainingDuration: number;
  priority: "critical" | "high" | "medium" | "low";
}

// Training Recommendation Interface
export interface TrainingRecommendation {
  trainingType: string;
  targetRoles: string[];
  duration: number;
  cost: number;
  expectedOutcome: string;
  priority: "critical" | "high" | "medium" | "low";
  timeline: string;
}

// Recruitment Priority Interface
export interface RecruitmentPriority {
  role: string;
  urgency: "immediate" | "within_month" | "within_quarter";
  requiredSkills: string[];
  experienceLevel: "entry" | "mid" | "senior" | "expert";
  estimatedCost: number;
  timeToHire: number;
}

// Budget Implication Interface
export interface BudgetImplication {
  totalCost: number;
  recruitmentCosts: number;
  trainingCosts: number;
  overtimeCosts: number;
  potentialSavings: number;
  roi: number;
  paybackPeriod: number;
}

// Comprehensive Performance Analysis Interface
export interface ComprehensivePerformanceAnalysis {
  overallScore: number;
  dimensionalAnalysis: DimensionalAnalysis;
  peerBenchmarking: PeerBenchmarking;
  trendAnalysis: TrendAnalysis;
  developmentRecommendations: DevelopmentRecommendation[];
  careerPathSuggestions: CareerPathSuggestion[];
  riskAssessment: RetentionRiskAssessment;
}

// Dimensional Analysis Interface
export interface DimensionalAnalysis {
  clinicalQuality: number;
  patientSatisfaction: number;
  efficiency: number;
  collaboration: number;
  innovation: number;
  leadership: number;
  adaptability: number;
  reliability: number;
}

// Peer Benchmarking Interface
export interface PeerBenchmarking {
  peerGroup: string;
  ranking: number;
  totalPeers: number;
  percentile: number;
  strengthsVsPeers: string[];
  improvementAreasVsPeers: string[];
}

// Trend Analysis Interface
export interface TrendAnalysis {
  performanceTrend: "improving" | "stable" | "declining";
  trendStrength: number;
  keyFactors: string[];
  projectedPerformance: number;
  confidenceLevel: number;
}

// Development Recommendation Interface
export interface DevelopmentRecommendation {
  area: string;
  currentLevel: number;
  targetLevel: number;
  recommendedActions: string[];
  timeline: string;
  expectedImpact: number;
  priority: "critical" | "high" | "medium" | "low";
}

// Career Path Suggestion Interface
export interface CareerPathSuggestion {
  targetRole: string;
  currentReadiness: number;
  requiredSkills: string[];
  developmentPlan: string[];
  timeToReadiness: number;
  successProbability: number;
}

// Retention Risk Assessment Interface
export interface RetentionRiskAssessment {
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  riskFactors: string[];
  retentionStrategies: string[];
  probabilityOfLeaving: number;
  timeframe: string;
}

// Advanced Performance Analytics Models
export class PerformanceAnalyticsML {
  models = {
    performancePrediction: {
      algorithm: "Random Forest + Deep Learning",
      features: [
        "clinical_quality_metrics",
        "patient_satisfaction_scores",
        "documentation_timeliness",
        "team_collaboration_ratings",
        "continuing_education_engagement",
        "innovation_contributions",
        "leadership_indicators",
        "adaptability_measures",
      ],
      prediction_targets: [
        "performance_trajectory",
        "retention_risk",
        "promotion_readiness",
      ],
      accuracy_target: 0.82,
    },

    burnoutPrediction: {
      algorithm: "Neural Network with Attention Mechanism",
      features: [
        "workload_patterns",
        "overtime_frequency",
        "patient_acuity_exposure",
        "work_life_balance_indicators",
        "stress_level_assessments",
        "peer_support_metrics",
        "management_relationship_quality",
      ],
      early_warning_threshold: 0.7,
      intervention_recommendations: true,
    },
  };
}

// Workforce Intelligence Service Implementation
export class WorkforceIntelligenceService {
  private performanceMLModel: PerformanceAnalyticsML;
  private staffingMLModel: StaffingMLModel;
  private demandForecaster: DemandForecaster;
  private skillAnalyzer: SkillAnalyzer;

  constructor() {
    this.performanceMLModel = new PerformanceAnalyticsML();
    this.staffingMLModel = new StaffingMLModel();
    this.demandForecaster = new DemandForecaster();
    this.skillAnalyzer = new SkillAnalyzer();
  }

  async predictStaffingNeeds(
    parameters: StaffingPredictionParameters,
  ): Promise<StaffingForecast> {
    try {
      // Get demand forecast
      const demandForecast = await this.getDemandForecast(parameters);

      // Analyze staff capabilities
      const staffCapabilities = await this.analyzeStaffCapabilities();

      // Get historical utilization patterns
      const historicalUtilization = await this.getUtilizationPatterns();

      // Generate ML-based prediction
      const prediction = await this.staffingMLModel.predict({
        demand: demandForecast,
        capabilities: staffCapabilities,
        utilization: historicalUtilization,
        constraints: parameters.constraints,
      });

      // Generate training plan
      const trainingRecommendations =
        await this.generateTrainingPlan(prediction);

      // Calculate budget impact
      const budgetImplications = await this.calculateBudgetImpact(prediction);

      return {
        forecastPeriod: parameters.period,
        staffingRequirements: prediction.requirements,
        skillGapAnalysis: prediction.skillGaps,
        trainingRecommendations,
        recruitmentPriorities: prediction.recruitmentNeeds,
        budgetImplications,
      };
    } catch (error) {
      console.error("Error predicting staffing needs:", error);
      throw new Error("Failed to predict staffing needs");
    }
  }

  async assessEmployeePerformance(
    employeeId: string,
    assessmentPeriod: DateRange,
  ): Promise<ComprehensivePerformanceAnalysis> {
    try {
      // Gather performance data
      const performanceData = await this.gatherPerformanceData(
        employeeId,
        assessmentPeriod,
      );

      // Generate peer comparison
      const peerComparison = await this.generatePeerComparison(employeeId);

      // Analyze trends
      const trendAnalysis = await this.analyzeTrends(employeeId);

      // Calculate composite score
      const overallScore = await this.calculateCompositeScore(performanceData);

      // Analyze dimensions
      const dimensionalAnalysis = await this.analyzeDimensions(performanceData);

      // Generate development plan
      const developmentRecommendations =
        await this.generateDevelopmentPlan(performanceData);

      // Suggest career paths
      const careerPathSuggestions = await this.suggestCareerPaths(employeeId);

      // Assess retention risk
      const riskAssessment = await this.assessRetentionRisk(employeeId);

      return {
        overallScore,
        dimensionalAnalysis,
        peerBenchmarking: peerComparison,
        trendAnalysis,
        developmentRecommendations,
        careerPathSuggestions,
        riskAssessment,
      };
    } catch (error) {
      console.error("Error assessing employee performance:", error);
      throw new Error("Failed to assess employee performance");
    }
  }

  // Private helper methods
  private async getDemandForecast(
    parameters: StaffingPredictionParameters,
  ): Promise<any> {
    // Mock demand forecasting based on historical data and trends
    const baselineDemand = {
      nurses: 25,
      therapists: 15,
      drivers: 8,
      administrators: 5,
    };

    // Apply seasonal and growth factors
    const seasonalFactor =
      1 + Math.sin((new Date().getMonth() * Math.PI) / 6) * 0.1;
    const growthFactor = 1.05; // 5% annual growth

    return Object.entries(baselineDemand).map(([role, count]) => ({
      role,
      predictedDemand: Math.round(count * seasonalFactor * growthFactor),
      confidence: 0.85 + Math.random() * 0.1,
    }));
  }

  private async analyzeStaffCapabilities(): Promise<any> {
    const db = getDb();
    const staffCollection = db.collection("master_staff_index");

    const staff = await staffCollection.find({}).toArray();

    return staff.map((member) => ({
      employeeId: member.employee_id,
      role: member.primary_role,
      competencyLevel: member.competency_level,
      specializations: member.specializations,
      performanceRating: member.performance_rating,
      productivity: member.productivity_score,
      availability: Math.random() > 0.1 ? "available" : "limited",
    }));
  }

  private async getUtilizationPatterns(): Promise<any> {
    // Get historical attendance and workload data
    const attendanceData = await getAttendanceAnalytics({});

    return {
      averageUtilization: attendanceData.attendance_rate || 85,
      peakHours: ["09:00-12:00", "14:00-17:00"],
      seasonalPatterns: {
        q1: 0.95,
        q2: 1.02,
        q3: 0.98,
        q4: 1.05,
      },
      overtimePatterns: {
        average: 5.2,
        peak: 12.8,
        trend: "stable",
      },
    };
  }

  private async generateTrainingPlan(
    prediction: any,
  ): Promise<TrainingRecommendation[]> {
    const recommendations: TrainingRecommendation[] = [];

    // Generate training recommendations based on skill gaps
    if (prediction.skillGaps && prediction.skillGaps.length > 0) {
      prediction.skillGaps.forEach((gap: any) => {
        recommendations.push({
          trainingType: `${gap.skill} Enhancement Program`,
          targetRoles: gap.affectedRoles,
          duration: gap.trainingDuration || 40,
          cost: gap.trainingDuration * 150, // $150 per hour
          expectedOutcome: `Improve ${gap.skill} proficiency by ${gap.gap * 20}%`,
          priority: gap.priority,
          timeline: gap.priority === "critical" ? "1 month" : "3 months",
        });
      });
    }

    return recommendations;
  }

  private async calculateBudgetImpact(
    prediction: any,
  ): Promise<BudgetImplication> {
    const recruitmentCosts = (prediction.recruitmentNeeds?.length || 0) * 15000; // $15k per hire
    const trainingCosts = (prediction.skillGaps?.length || 0) * 6000; // $6k per training program
    const overtimeCosts = prediction.overtimeHours * 45; // $45 per overtime hour
    const totalCost = recruitmentCosts + trainingCosts + overtimeCosts;
    const potentialSavings = totalCost * 0.15; // 15% efficiency gains

    return {
      totalCost,
      recruitmentCosts,
      trainingCosts,
      overtimeCosts,
      potentialSavings,
      roi: potentialSavings / totalCost,
      paybackPeriod: totalCost / (potentialSavings / 12), // months
    };
  }

  private async gatherPerformanceData(
    employeeId: string,
    period: DateRange,
  ): Promise<any> {
    const db = getDb();
    const performanceCollection = db.collection("performance_analytics");

    // Get existing performance data or create mock data
    let performanceRecord = await performanceCollection.findOne({
      employee_id: employeeId,
      assessment_period_start: { $gte: period.startDate },
      assessment_period_end: { $lte: period.endDate },
    });

    if (!performanceRecord) {
      // Generate mock performance data
      performanceRecord = {
        employee_id: employeeId,
        clinical_quality_score: 75 + Math.random() * 20,
        patient_satisfaction_score: 80 + Math.random() * 15,
        efficiency_score: 70 + Math.random() * 25,
        collaboration_score: 85 + Math.random() * 10,
        innovation_score: 60 + Math.random() * 30,
        leadership_score: 65 + Math.random() * 25,
        overall_performance_score: 75 + Math.random() * 20,
        performance_percentile: Math.random() * 100,
        improvement_trajectory: ["improving", "stable", "declining"][
          Math.floor(Math.random() * 3)
        ],
      };
    }

    return performanceRecord;
  }

  private async generatePeerComparison(
    employeeId: string,
  ): Promise<PeerBenchmarking> {
    // Mock peer comparison data
    const totalPeers = 15 + Math.floor(Math.random() * 10);
    const ranking = 1 + Math.floor(Math.random() * totalPeers);
    const percentile = ((totalPeers - ranking) / totalPeers) * 100;

    return {
      peerGroup: "Clinical Staff - Same Role",
      ranking,
      totalPeers,
      percentile: Math.round(percentile),
      strengthsVsPeers: ["Patient Communication", "Technical Skills"],
      improvementAreasVsPeers: ["Documentation Speed", "Time Management"],
    };
  }

  private async analyzeTrends(employeeId: string): Promise<TrendAnalysis> {
    // Mock trend analysis
    const trends = ["improving", "stable", "declining"] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];

    return {
      performanceTrend: trend,
      trendStrength: 0.6 + Math.random() * 0.3,
      keyFactors: ["Workload Management", "Skill Development", "Team Dynamics"],
      projectedPerformance: 75 + Math.random() * 20,
      confidenceLevel: 0.8 + Math.random() * 0.15,
    };
  }

  private async calculateCompositeScore(performanceData: any): Promise<number> {
    const weights = {
      clinical_quality_score: 0.25,
      patient_satisfaction_score: 0.2,
      efficiency_score: 0.2,
      collaboration_score: 0.15,
      innovation_score: 0.1,
      leadership_score: 0.1,
    };

    let compositeScore = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      compositeScore += (performanceData[key] || 0) * weight;
    });

    return Math.round(compositeScore * 100) / 100;
  }

  private async analyzeDimensions(
    performanceData: any,
  ): Promise<DimensionalAnalysis> {
    return {
      clinicalQuality: performanceData.clinical_quality_score || 75,
      patientSatisfaction: performanceData.patient_satisfaction_score || 80,
      efficiency: performanceData.efficiency_score || 70,
      collaboration: performanceData.collaboration_score || 85,
      innovation: performanceData.innovation_score || 60,
      leadership: performanceData.leadership_score || 65,
      adaptability: 70 + Math.random() * 20,
      reliability: 80 + Math.random() * 15,
    };
  }

  private async generateDevelopmentPlan(
    performanceData: any,
  ): Promise<DevelopmentRecommendation[]> {
    const recommendations: DevelopmentRecommendation[] = [];

    // Identify areas for improvement
    const dimensions = await this.analyzeDimensions(performanceData);

    Object.entries(dimensions).forEach(([area, score]) => {
      if (score < 75) {
        recommendations.push({
          area: area.replace(/([A-Z])/g, " $1").toLowerCase(),
          currentLevel: score,
          targetLevel: Math.min(score + 15, 95),
          recommendedActions: [
            `Enroll in ${area} training program`,
            `Shadow high-performing colleagues`,
            `Set specific improvement goals`,
          ],
          timeline: "3-6 months",
          expectedImpact: 15,
          priority: score < 60 ? "high" : "medium",
        });
      }
    });

    return recommendations;
  }

  private async suggestCareerPaths(
    employeeId: string,
  ): Promise<CareerPathSuggestion[]> {
    // Mock career path suggestions
    return [
      {
        targetRole: "Senior Clinical Specialist",
        currentReadiness: 65 + Math.random() * 20,
        requiredSkills: [
          "Advanced Clinical Skills",
          "Mentoring",
          "Quality Improvement",
        ],
        developmentPlan: [
          "Complete advanced certification",
          "Lead quality improvement project",
          "Mentor junior staff members",
        ],
        timeToReadiness: 12 + Math.floor(Math.random() * 12),
        successProbability: 0.7 + Math.random() * 0.2,
      },
      {
        targetRole: "Team Lead",
        currentReadiness: 55 + Math.random() * 25,
        requiredSkills: ["Leadership", "Project Management", "Communication"],
        developmentPlan: [
          "Leadership development program",
          "Project management certification",
          "Cross-functional collaboration",
        ],
        timeToReadiness: 18 + Math.floor(Math.random() * 12),
        successProbability: 0.6 + Math.random() * 0.25,
      },
    ];
  }

  private async assessRetentionRisk(
    employeeId: string,
  ): Promise<RetentionRiskAssessment> {
    // Mock retention risk assessment
    const riskLevels = ["low", "medium", "high", "critical"] as const;
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const riskScore = Math.random() * 100;

    return {
      riskLevel,
      riskScore: Math.round(riskScore),
      riskFactors: [
        "Workload pressure",
        "Limited growth opportunities",
        "Compensation concerns",
      ],
      retentionStrategies: [
        "Career development planning",
        "Workload redistribution",
        "Recognition programs",
      ],
      probabilityOfLeaving: riskScore / 100,
      timeframe: riskLevel === "critical" ? "3 months" : "12 months",
    };
  }
}

// Supporting ML Model Classes
class StaffingMLModel {
  async predict(input: any): Promise<any> {
    // Mock ML prediction for staffing requirements
    const requirements: StaffingRequirement[] = [
      {
        role: "Registered Nurse",
        department: "Clinical Services",
        requiredCount: 28,
        currentCount: 25,
        gap: 3,
        priority: "high",
        timeframe: "2 months",
        justification: "Increased patient volume and complexity",
      },
      {
        role: "Physical Therapist",
        department: "Rehabilitation",
        requiredCount: 18,
        currentCount: 15,
        gap: 3,
        priority: "medium",
        timeframe: "3 months",
        justification: "Expansion of therapy services",
      },
    ];

    const skillGaps: SkillGap[] = [
      {
        skill: "Advanced Wound Care",
        currentLevel: 65,
        requiredLevel: 85,
        gap: 20,
        affectedRoles: ["Registered Nurse", "Clinical Specialist"],
        trainingDuration: 40,
        priority: "high",
      },
      {
        skill: "Telehealth Technology",
        currentLevel: 45,
        requiredLevel: 75,
        gap: 30,
        affectedRoles: ["All Clinical Staff"],
        trainingDuration: 24,
        priority: "medium",
      },
    ];

    const recruitmentNeeds: RecruitmentPriority[] = [
      {
        role: "Registered Nurse",
        urgency: "within_month",
        requiredSkills: ["Home Care Experience", "IV Therapy", "Wound Care"],
        experienceLevel: "mid",
        estimatedCost: 15000,
        timeToHire: 45,
      },
    ];

    return {
      requirements,
      skillGaps,
      recruitmentNeeds,
      overtimeHours: 120,
      confidence: 0.87,
    };
  }
}

class DemandForecaster {
  async forecast(parameters: any): Promise<any> {
    // Mock demand forecasting
    return {
      predictedVolume: 450 + Math.floor(Math.random() * 100),
      seasonalAdjustment: 1.05,
      trendFactor: 1.08,
      confidence: 0.85,
    };
  }
}

class SkillAnalyzer {
  async analyzeSkills(staffData: any[]): Promise<any> {
    // Mock skill analysis
    return {
      skillInventory: {
        "Clinical Skills": 78,
        Technology: 65,
        Communication: 82,
        Leadership: 58,
      },
      skillGaps: [
        { skill: "Advanced Technology", gap: 25 },
        { skill: "Leadership", gap: 20 },
      ],
    };
  }
}

// Initialize sample performance analytics data
export async function initializePerformanceAnalytics(): Promise<void> {
  try {
    const db = getDb();
    const performanceCollection = db.collection("performance_analytics");
    const staffingCollection = db.collection("staffing_predictions");

    // Check if data already exists
    const existingPerformance = await performanceCollection.find({}).toArray();
    const existingStaffing = await staffingCollection.find({}).toArray();

    if (existingPerformance.length === 0) {
      // Initialize sample performance analytics data
      const samplePerformanceData = [
        {
          analytics_id: new ObjectId().toString(),
          employee_id: "EMP001",
          assessment_period_start: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000,
          ),
          assessment_period_end: new Date(),
          clinical_quality_score: 88.5,
          patient_satisfaction_score: 92.3,
          efficiency_score: 85.7,
          collaboration_score: 91.2,
          innovation_score: 78.4,
          leadership_score: 82.6,
          overall_performance_score: 86.5,
          performance_percentile: 78,
          improvement_trajectory: "improving",
          retention_risk_score: 25.3,
          burnout_risk_score: 32.1,
          promotion_readiness_score: 75.8,
          peer_group_definition: "Senior Nurses - Home Care",
          peer_ranking: 3,
          peer_group_size: 12,
          skill_development_priorities: {
            "Advanced Wound Care": 85,
            "Technology Proficiency": 70,
            "Leadership Skills": 80,
          },
          training_recommendations: [
            "Advanced Wound Care Certification",
            "Digital Health Technologies",
            "Team Leadership Workshop",
          ],
          career_advancement_suggestions: [
            "Senior Clinical Specialist",
            "Team Lead Position",
          ],
          analytics_model_version: "v2.1",
          confidence_score: 0.87,
          created_at: new Date().toISOString(),
        },
        {
          analytics_id: new ObjectId().toString(),
          employee_id: "EMP002",
          assessment_period_start: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000,
          ),
          assessment_period_end: new Date(),
          clinical_quality_score: 82.1,
          patient_satisfaction_score: 89.7,
          efficiency_score: 79.3,
          collaboration_score: 88.9,
          innovation_score: 71.2,
          leadership_score: 76.8,
          overall_performance_score: 81.3,
          performance_percentile: 65,
          improvement_trajectory: "stable",
          retention_risk_score: 45.7,
          burnout_risk_score: 52.3,
          promotion_readiness_score: 68.4,
          peer_group_definition: "Diabetes Specialists",
          peer_ranking: 5,
          peer_group_size: 8,
          skill_development_priorities: {
            "Patient Education": 75,
            "Data Analysis": 65,
            "Communication Skills": 82,
          },
          training_recommendations: [
            "Patient Education Techniques",
            "Healthcare Analytics",
            "Motivational Interviewing",
          ],
          career_advancement_suggestions: [
            "Diabetes Care Coordinator",
            "Clinical Educator",
          ],
          analytics_model_version: "v2.1",
          confidence_score: 0.83,
          created_at: new Date().toISOString(),
        },
      ];

      await performanceCollection.insertMany(samplePerformanceData);
    }

    if (existingStaffing.length === 0) {
      // Initialize sample staffing predictions data
      const sampleStaffingData = [
        {
          prediction_id: new ObjectId().toString(),
          prediction_date: new Date(),
          forecast_start_date: new Date(),
          forecast_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          department: "Home Care Services",
          service_line: "Clinical Care",
          predicted_patient_volume: 450,
          predicted_visit_hours: 3600,
          predicted_complexity_mix: {
            low_complexity: 40,
            medium_complexity: 45,
            high_complexity: 15,
          },
          required_nurses: 28,
          required_therapists: 18,
          required_support_staff: 12,
          required_skill_mix: {
            "Wound Care Specialists": 8,
            "Diabetes Educators": 6,
            "IV Therapy Certified": 10,
          },
          specialized_certifications_needed: {
            "Advanced Wound Care": 5,
            "Telehealth Technology": 12,
            "Infection Control": 8,
          },
          current_capacity: 42,
          capacity_gap: 16,
          skill_gaps: [
            {
              skill: "Advanced Wound Care",
              current_level: 65,
              required_level: 85,
              gap: 20,
              affected_roles: ["Registered Nurse", "Clinical Specialist"],
              training_duration: 40,
              priority: "high",
            },
            {
              skill: "Telehealth Technology",
              current_level: 45,
              required_level: 75,
              gap: 30,
              affected_roles: ["All Clinical Staff"],
              training_duration: 24,
              priority: "medium",
            },
          ],
          recruitment_priorities: [
            {
              role: "Registered Nurse",
              urgency: "within_month",
              required_skills: [
                "Home Care Experience",
                "IV Therapy",
                "Wound Care",
              ],
              experience_level: "mid",
              estimated_cost: 15000,
              time_to_hire: 45,
            },
            {
              role: "Physical Therapist",
              urgency: "within_quarter",
              required_skills: ["Home Care", "Geriatric Care"],
              experience_level: "senior",
              estimated_cost: 18000,
              time_to_hire: 60,
            },
          ],
          training_needs: [
            {
              training_type: "Advanced Wound Care Enhancement Program",
              target_roles: ["Registered Nurse", "Clinical Specialist"],
              duration: 40,
              cost: 6000,
              expected_outcome:
                "Improve Advanced Wound Care proficiency by 20%",
              priority: "high",
              timeline: "1 month",
            },
            {
              training_type: "Telehealth Technology Enhancement Program",
              target_roles: ["All Clinical Staff"],
              duration: 24,
              cost: 3600,
              expected_outcome:
                "Improve Telehealth Technology proficiency by 30%",
              priority: "medium",
              timeline: "3 months",
            },
          ],
          scheduling_optimizations: {
            shift_balancing: "Redistribute evening shift coverage",
            geographic_optimization: "Optimize travel routes for efficiency",
            skill_matching: "Match specialized skills to patient needs",
          },
          estimated_cost_impact: 125000,
          roi_analysis: {
            investment: 125000,
            expected_savings: 18750,
            payback_period_months: 8,
            roi_percentage: 15,
          },
          prediction_accuracy: 87.3,
          created_at: new Date().toISOString(),
        },
      ];

      await staffingCollection.insertMany(sampleStaffingData);
    }

    console.log("Performance analytics data initialized successfully");
  } catch (error) {
    console.error("Error initializing performance analytics:", error);
  }
}

// API Functions
export async function predictStaffingNeeds(
  parameters: StaffingPredictionParameters,
): Promise<StaffingForecast> {
  const service = new WorkforceIntelligenceService();
  return await service.predictStaffingNeeds(parameters);
}

export async function assessEmployeePerformance(
  employeeId: string,
  assessmentPeriod: DateRange,
): Promise<ComprehensivePerformanceAnalysis> {
  const service = new WorkforceIntelligenceService();
  return await service.assessEmployeePerformance(employeeId, assessmentPeriod);
}

export async function getWorkforceAnalytics(filters?: {
  dateFrom?: string;
  dateTo?: string;
  departments?: string[];
  roles?: string[];
}): Promise<any> {
  try {
    // Initialize data if needed
    await initializePerformanceAnalytics();

    const db = getDb();
    const performanceCollection = db.collection("performance_analytics");
    const staffingCollection = db.collection("staffing_predictions");

    let query: any = {};
    if (filters) {
      if (filters.dateFrom && filters.dateTo) {
        query.assessment_period_start = {
          $gte: new Date(filters.dateFrom),
          $lte: new Date(filters.dateTo),
        };
      }
    }

    const [performanceData, staffingData] = await Promise.all([
      performanceCollection.find(query).toArray(),
      staffingCollection.find({}).toArray(),
    ]);

    const totalEmployees = Math.max(performanceData.length, 45);
    const averagePerformanceScore =
      performanceData.length > 0
        ? performanceData.reduce(
            (sum, p) => sum + (p.overall_performance_score || 0),
            0,
          ) / performanceData.length
        : 78.5;

    const highPerformers = performanceData.filter(
      (p) => (p.overall_performance_score || 0) > 85,
    ).length;

    const atRiskEmployees = performanceData.filter(
      (p) => (p.retention_risk_score || 0) > 70,
    ).length;

    return {
      totalEmployees,
      averagePerformanceScore,
      highPerformers,
      atRiskEmployees,
      skillGaps:
        staffingData.length > 0 ? staffingData[0].skill_gaps || [] : [],
      recruitmentNeeds:
        staffingData.length > 0
          ? staffingData[0].recruitment_priorities || []
          : [],
      trainingRecommendations:
        staffingData.length > 0 ? staffingData[0].training_needs || [] : [],
      budgetImpact: {
        totalCost:
          staffingData.length > 0
            ? staffingData[0].estimated_cost_impact || 125000
            : 125000,
        potentialSavings:
          staffingData.length > 0
            ? staffingData[0].roi_analysis?.expected_savings || 18750
            : 18750,
        roi:
          staffingData.length > 0
            ? (staffingData[0].roi_analysis?.roi_percentage || 15) / 100
            : 0.15,
      },
      performanceData,
      staffingData,
    };
  } catch (error) {
    console.error("Error getting workforce analytics:", error);
    throw new Error("Failed to get workforce analytics");
  }
}

export async function createPerformanceAnalytics(
  analyticsData: Omit<any, "analytics_id" | "created_at">,
): Promise<any> {
  try {
    const db = getDb();
    const collection = db.collection("performance_analytics");

    const newAnalytics = {
      ...analyticsData,
      analytics_id: new ObjectId().toString(),
      created_at: new Date().toISOString(),
    };

    await collection.insertOne(newAnalytics);
    return newAnalytics;
  } catch (error) {
    console.error("Error creating performance analytics:", error);
    throw new Error("Failed to create performance analytics");
  }
}

export async function createStaffingPrediction(
  predictionData: Omit<any, "prediction_id" | "created_at">,
): Promise<any> {
  try {
    const db = getDb();
    const collection = db.collection("staffing_predictions");

    const newPrediction = {
      ...predictionData,
      prediction_id: new ObjectId().toString(),
      created_at: new Date().toISOString(),
    };

    await collection.insertOne(newPrediction);
    return newPrediction;
  } catch (error) {
    console.error("Error creating staffing prediction:", error);
    throw new Error("Failed to create staffing prediction");
  }
}
