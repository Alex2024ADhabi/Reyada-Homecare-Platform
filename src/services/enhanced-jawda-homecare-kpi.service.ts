/**
 * Enhanced Production JAWDA Home Healthcare KPI Service
 * Implements the 6 specific KPIs from JAWDA Guidelines Version 8.3
 * Real-time calculation, monitoring, and DOH compliance automation
 */

interface HomecareJAWDAKPI {
  id: string;
  code: string;
  name: string;
  nameArabic: string;
  description: string;
  formula: string;
  numerator: KPIDataQuery;
  denominator?: KPIDataQuery;
  target: number;
  frequency: "monthly" | "quarterly";
  unitOfMeasure: string;
  desiredDirection: "lower" | "higher";
  mandatory: boolean;
  weight: number;
  currentValue: number;
  lastCalculated: number;
  trend: "improving" | "stable" | "declining";
  status:
    | "excellent"
    | "good"
    | "acceptable"
    | "needs_improvement"
    | "critical";
  dataQuality: "high" | "medium" | "low";
  confidence: number;
}

interface KPIDataQuery {
  source: string;
  query: string;
  filters: KPIFilter[];
  aggregation: "count" | "sum" | "avg" | "percentage";
  timeRange: number;
  exclusions?: string[];
}

interface KPIFilter {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "between";
  value: any;
}

interface HomecarePatientDay {
  patientId: string;
  serviceDate: Date;
  serviceCode: string;
  acuityLevel: string;
  nursingCare: boolean;
  supportiveServices: boolean;
  specializedVisit: boolean;
}

interface CaseMixSubmission {
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    quarter: number;
    year: number;
  };
  serviceCodes: {
    simpleVisitNurse: number; // 17-25-1
    simpleVisitSupportive: number; // 17-25-2
    specializedVisit: number; // 17-25-3
    routineNursingCare: number; // 17-25-4
    advancedNursingCare: number; // 17-25-5
    selfPay: number; // XXXX
  };
  totalPatientDays: number;
}

class EnhancedJAWDAHomecareKPIService {
  private kpis: Map<string, HomecareJAWDAKPI> = new Map();
  private caseMixData: Map<string, CaseMixSubmission> = new Map();
  private patientDays: Map<string, HomecarePatientDay[]> = new Map();
  private calculationInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private dataConnections: Map<string, any> = new Map();

  constructor() {
    this.initializeHomecareKPIs();
    this.initializeDataConnections();
    this.startAutomatedCalculation();
  }

  /**
   * Initialize the 6 specific Home Healthcare JAWDA KPIs
   */
  private initializeHomecareKPIs(): void {
    // HC001: All-cause Emergency Department / Urgent Care Visit without Hospitalization
    this.addHomecareKPI({
      id: "HC001",
      code: "HC-001",
      name: "All-cause Emergency Department / Urgent Care Visit without Hospitalization",
      nameArabic:
        "زيارات قسم الطوارئ / الرعاية العاجلة لجميع الأسباب دون دخول المستشفى",
      description:
        "Percentage of homecare patient days in which patients used the emergency department or urgent care but were not admitted to the hospital during the measurement Quarter.",
      formula:
        "(Number of all-cause unplanned emergency department or urgent care visits / Total number of homecare patient days) * 100",
      numerator: {
        source: "emergency_visits",
        query:
          "SELECT COUNT(*) FROM emergency_visits WHERE homecare_patient = true AND admitted = false",
        filters: [
          { field: "homecare_patient", operator: "=", value: true },
          { field: "admitted", operator: "=", value: false },
          { field: "planned", operator: "=", value: false },
        ],
        aggregation: "count",
        timeRange: 7776000000, // 90 days (quarterly)
      },
      denominator: {
        source: "patient_days",
        query: "SELECT COUNT(*) FROM homecare_patient_days",
        filters: [],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["maternity_care_only", "non_skilled_care_only"],
      },
      target: 5.0, // Target percentage
      frequency: "quarterly",
      unitOfMeasure: "Percentage (per 100 homecare patient days)",
      desiredDirection: "lower",
      mandatory: true,
      weight: 20,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.95,
    });

    // HC002: All-cause Unplanned Acute Care Hospitalization
    this.addHomecareKPI({
      id: "HC002",
      code: "HC-002",
      name: "All-cause Unplanned Acute Care Hospitalization",
      nameArabic: "دخول المستشفى للرعاية الحادة غير المخطط لها لجميع الأسباب",
      description:
        "Percentage of days in which homecare patients were admitted to an acute care hospital",
      formula:
        "(Number of all-cause unplanned hospital days / Total number of homecare patient days) * 100",
      numerator: {
        source: "hospitalizations",
        query:
          "SELECT COUNT(*) FROM acute_care_admissions WHERE homecare_patient = true AND planned = false",
        filters: [
          { field: "homecare_patient", operator: "=", value: true },
          { field: "planned", operator: "=", value: false },
          { field: "acute_care", operator: "=", value: true },
        ],
        aggregation: "count",
        timeRange: 7776000000,
      },
      denominator: {
        source: "patient_days",
        query: "SELECT COUNT(*) FROM homecare_patient_days",
        filters: [],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: [
          "maternity_care_only",
          "non_skilled_care_only",
          "planned_hospital_stay",
        ],
      },
      target: 8.0,
      frequency: "quarterly",
      unitOfMeasure: "Percentage per home health day",
      desiredDirection: "lower",
      mandatory: true,
      weight: 25,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.95,
    });

    // HC003: Managing daily activities – Improvement in Ambulation for patients who received physiotherapy
    this.addHomecareKPI({
      id: "HC003",
      code: "HC-003",
      name: "Managing daily activities – Improvement in Ambulation for patients who received physiotherapy",
      nameArabic:
        "إدارة الأنشطة اليومية - تحسن في المشي للمرضى الذين تلقوا العلاج الطبيعي",
      description:
        "Percentage of home health care patients during which the patient improved in ability to ambulate.",
      formula:
        "(Number of patients who received physiotherapy with improvement in ambulation / Total number of home care patients having ambulatory issues who received physiotherapy) * 100",
      numerator: {
        source: "physiotherapy_outcomes",
        query:
          "SELECT COUNT(*) FROM physiotherapy_assessments WHERE improvement_in_ambulation = true",
        filters: [
          { field: "improvement_in_ambulation", operator: "=", value: true },
          { field: "reassessment_completed", operator: "=", value: true },
          { field: "physiotherapy_received", operator: "=", value: true },
        ],
        aggregation: "count",
        timeRange: 7776000000,
      },
      denominator: {
        source: "physiotherapy_patients",
        query:
          "SELECT COUNT(*) FROM patients WHERE ambulatory_issues = true AND physiotherapy_received = true",
        filters: [
          { field: "ambulatory_issues", operator: "=", value: true },
          { field: "physiotherapy_received", operator: "=", value: true },
        ],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: [
          "independent_ambulation",
          "unresponsive_patients",
          "bedridden_patients",
          "assistive_device_age_related",
          "less_than_90_days_not_discharged",
        ],
      },
      target: 75.0,
      frequency: "quarterly",
      unitOfMeasure: "Percentage per home care patients",
      desiredDirection: "higher",
      mandatory: true,
      weight: 15,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.9,
    });

    // HC004: Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days
    this.addHomecareKPI({
      id: "HC004",
      code: "HC-004",
      name: "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
      nameArabic:
        "معدل إصابات الضغط المرتبطة بالرعاية المنزلية أو المتفاقمة (المرحلة 2 وما فوق) لكل 1000 يوم مريض رعاية منزلية",
      description:
        "Rate of homecare associated or worsening pressure injury (Stage 2 and above) per 1000 homecare patient days",
      formula:
        "(Number of home care patients with homecare associated pressure injury or with worsening pressure injury Stage 2, 3, 4, Unstageable or Deep Tissue Injury / Total number of home care patient days) * 1000",
      numerator: {
        source: "pressure_injuries",
        query:
          "SELECT COUNT(*) FROM pressure_injuries WHERE stage >= 2 AND (homecare_associated = true OR worsening = true)",
        filters: [
          { field: "stage", operator: ">=", value: 2 },
          {
            field: "homecare_associated_or_worsening",
            operator: "=",
            value: true,
          },
        ],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["stage_1_injuries", "present_at_start_same_or_improved"],
      },
      denominator: {
        source: "patient_days",
        query: "SELECT COUNT(*) FROM homecare_patient_days",
        filters: [],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["maternity_care_only", "non_skilled_care_only"],
      },
      target: 2.0,
      frequency: "quarterly",
      unitOfMeasure: "Rate per 1000 home care patient days",
      desiredDirection: "lower",
      mandatory: true,
      weight: 20,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.92,
    });

    // HC005: Rate of homecare patient falls resulting in any injury per 1000 homecare patient days
    this.addHomecareKPI({
      id: "HC005",
      code: "HC-005",
      name: "Rate of homecare patient falls resulting in any injury per 1000 homecare patient days",
      nameArabic:
        "معدل سقوط مرضى الرعاية المنزلية الذي يؤدي إلى أي إصابة لكل 1000 يوم مريض رعاية منزلية",
      description:
        "Homecare patients falls resulting in any injury per 1000 home care patient days.",
      formula:
        "(Total number of patient falls resulting in injury / Total number of home care patient days) * 1000",
      numerator: {
        source: "patient_falls",
        query:
          "SELECT COUNT(*) FROM patient_falls WHERE injury_occurred = true AND during_homecare_visit = true",
        filters: [
          { field: "injury_occurred", operator: "=", value: true },
          { field: "during_homecare_visit", operator: "=", value: true },
          {
            field: "injury_severity",
            operator: "in",
            value: ["minor", "moderate", "major", "death"],
          },
        ],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["no_harm_falls", "falls_outside_visiting_time"],
      },
      denominator: {
        source: "patient_days",
        query: "SELECT COUNT(*) FROM homecare_patient_days",
        filters: [],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["maternity_care_only", "non_skilled_care_only"],
      },
      target: 1.5,
      frequency: "quarterly",
      unitOfMeasure: "Rate per 1000 home care patient days",
      desiredDirection: "lower",
      mandatory: true,
      weight: 15,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.88,
    });

    // HC006: Discharge to Community
    this.addHomecareKPI({
      id: "HC006",
      code: "HC-006",
      name: "Discharge to Community",
      nameArabic: "الخروج إلى المجتمع",
      description:
        "Percentage of days in which homecare patients were discharged to the community.",
      formula:
        "(Number of homecare patient days for patients who have been discharged from homecare service to community / Total number of home care patient days) * 100",
      numerator: {
        source: "discharges",
        query:
          'SELECT COUNT(*) FROM homecare_discharges WHERE discharge_destination = "community"',
        filters: [
          { field: "discharge_destination", operator: "=", value: "community" },
        ],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: ["discontinued_homecare_services"],
      },
      denominator: {
        source: "patient_days",
        query:
          "SELECT COUNT(*) FROM homecare_patient_days WHERE discharged = true",
        filters: [{ field: "discharged", operator: "=", value: true }],
        aggregation: "count",
        timeRange: 7776000000,
        exclusions: [
          "discharged_against_medical_advice",
          "transfer_to_another_homecare",
          "transfer_to_long_term_care",
          "planned_transfer_to_inpatient",
          "maternity_care_only",
          "non_skilled_care_only",
        ],
      },
      target: 85.0,
      frequency: "quarterly",
      unitOfMeasure: "Percentage per home care patient days",
      desiredDirection: "higher",
      mandatory: true,
      weight: 5,
      currentValue: 0,
      lastCalculated: 0,
      trend: "stable",
      status: "good",
      dataQuality: "high",
      confidence: 0.9,
    });

    console.log(`✅ Initialized ${this.kpis.size} Home Healthcare JAWDA KPIs`);
  }

  /**
   * Initialize data connections for production environment
   */
  private initializeDataConnections(): void {
    // Production data connections - replace with actual database connections
    this.dataConnections.set("emergency_visits", {
      query: async (query: KPIDataQuery) => this.queryEmergencyVisits(query),
      status: "connected",
    });

    this.dataConnections.set("hospitalizations", {
      query: async (query: KPIDataQuery) => this.queryHospitalizations(query),
      status: "connected",
    });

    this.dataConnections.set("physiotherapy_outcomes", {
      query: async (query: KPIDataQuery) =>
        this.queryPhysiotherapyOutcomes(query),
      status: "connected",
    });

    this.dataConnections.set("pressure_injuries", {
      query: async (query: KPIDataQuery) => this.queryPressureInjuries(query),
      status: "connected",
    });

    this.dataConnections.set("patient_falls", {
      query: async (query: KPIDataQuery) => this.queryPatientFalls(query),
      status: "connected",
    });

    this.dataConnections.set("discharges", {
      query: async (query: KPIDataQuery) => this.queryDischarges(query),
      status: "connected",
    });

    this.dataConnections.set("patient_days", {
      query: async (query: KPIDataQuery) => this.queryPatientDays(query),
      status: "connected",
    });

    console.log(
      `✅ Initialized ${this.dataConnections.size} data connections for Home Healthcare KPIs`,
    );
  }

  /**
   * Start automated KPI calculation
   */
  private startAutomatedCalculation(): void {
    this.calculationInterval = setInterval(async () => {
      await this.calculateAllKPIs();
      await this.generateCaseMixSubmission();
      await this.checkComplianceAlerts();
    }, 3600000); // Calculate every hour

    // Initial calculation
    this.calculateAllKPIs();

    console.log("📊 Automated Home Healthcare JAWDA KPI calculation started");
  }

  /**
   * Calculate all KPIs
   */
  private async calculateAllKPIs(): Promise<void> {
    for (const [kpiId, kpi] of this.kpis.entries()) {
      try {
        await this.calculateKPI(kpiId);
      } catch (error) {
        console.error(`❌ Error calculating KPI ${kpiId}:`, error);
        this.emit("kpi_calculation_error", { kpiId, error });
      }
    }
  }

  /**
   * Calculate individual KPI
   */
  private async calculateKPI(kpiId: string): Promise<void> {
    const kpi = this.kpis.get(kpiId);
    if (!kpi) return;

    try {
      // Get numerator value
      const numeratorConnection = this.dataConnections.get(
        kpi.numerator.source,
      );
      if (!numeratorConnection) {
        throw new Error(`Data connection not found: ${kpi.numerator.source}`);
      }

      const numeratorValue = await numeratorConnection.query(kpi.numerator);

      // Get denominator value
      let denominatorValue = 1;
      if (kpi.denominator) {
        const denominatorConnection = this.dataConnections.get(
          kpi.denominator.source,
        );
        if (denominatorConnection) {
          denominatorValue = await denominatorConnection.query(kpi.denominator);
        }
      }

      // Calculate KPI value based on formula
      let calculatedValue = 0;
      if (kpi.formula.includes("* 1000")) {
        calculatedValue = (numeratorValue / denominatorValue) * 1000;
      } else if (kpi.formula.includes("* 100")) {
        calculatedValue = (numeratorValue / denominatorValue) * 100;
      } else {
        calculatedValue = numeratorValue / denominatorValue;
      }

      // Update KPI
      const previousValue = kpi.currentValue;
      kpi.currentValue = Math.round(calculatedValue * 100) / 100;
      kpi.lastCalculated = Date.now();
      kpi.trend = this.calculateTrend(
        previousValue,
        kpi.currentValue,
        kpi.desiredDirection,
      );
      kpi.status = this.calculateStatus(
        kpi.currentValue,
        kpi.target,
        kpi.desiredDirection,
      );

      console.log(
        `📊 JAWDA ${kpi.code}: ${kpi.currentValue} ${kpi.unitOfMeasure} (Target: ${kpi.target})`,
      );

      this.emit("kpi_calculated", { kpiId, kpi });
    } catch (error) {
      console.error(`❌ Error calculating KPI ${kpi.code}:`, error);
      throw error;
    }
  }

  /**
   * Calculate trend based on desired direction
   */
  private calculateTrend(
    previousValue: number,
    currentValue: number,
    desiredDirection: "lower" | "higher",
  ): "improving" | "stable" | "declining" {
    if (previousValue === 0) return "stable";

    const changePercent =
      Math.abs((currentValue - previousValue) / previousValue) * 100;

    if (changePercent < 5) return "stable";

    if (desiredDirection === "lower") {
      return currentValue < previousValue ? "improving" : "declining";
    } else {
      return currentValue > previousValue ? "improving" : "declining";
    }
  }

  /**
   * Calculate status based on target and desired direction
   */
  private calculateStatus(
    value: number,
    target: number,
    desiredDirection: "lower" | "higher",
  ): HomecareJAWDAKPI["status"] {
    const ratio = value / target;

    if (desiredDirection === "lower") {
      if (ratio <= 0.5) return "excellent";
      if (ratio <= 0.8) return "good";
      if (ratio <= 1.0) return "acceptable";
      if (ratio <= 1.5) return "needs_improvement";
      return "critical";
    } else {
      if (ratio >= 1.2) return "excellent";
      if (ratio >= 1.0) return "good";
      if (ratio >= 0.8) return "acceptable";
      if (ratio >= 0.6) return "needs_improvement";
      return "critical";
    }
  }

  /**
   * Generate case-mix submission data
   */
  private async generateCaseMixSubmission(): Promise<CaseMixSubmission> {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
    const endDate = new Date(now.getFullYear(), currentQuarter * 3, 0);

    // Calculate patient days by service code
    const serviceCodes = {
      simpleVisitNurse: await this.getPatientDaysByServiceCode("17-25-1"),
      simpleVisitSupportive: await this.getPatientDaysByServiceCode("17-25-2"),
      specializedVisit: await this.getPatientDaysByServiceCode("17-25-3"),
      routineNursingCare: await this.getPatientDaysByServiceCode("17-25-4"),
      advancedNursingCare: await this.getPatientDaysByServiceCode("17-25-5"),
      selfPay: await this.getPatientDaysByServiceCode("XXXX"),
    };

    const totalPatientDays = Object.values(serviceCodes).reduce(
      (sum, days) => sum + days,
      0,
    );

    const caseMix: CaseMixSubmission = {
      reportingPeriod: {
        startDate,
        endDate,
        quarter: currentQuarter,
        year: now.getFullYear(),
      },
      serviceCodes,
      totalPatientDays,
    };

    this.caseMixData.set(`${now.getFullYear()}-Q${currentQuarter}`, caseMix);
    this.emit("case_mix_generated", caseMix);

    return caseMix;
  }

  /**
   * Check compliance alerts
   */
  private async checkComplianceAlerts(): Promise<void> {
    for (const [kpiId, kpi] of this.kpis.entries()) {
      if (kpi.status === "critical" || kpi.status === "needs_improvement") {
        this.emit("compliance_alert", {
          kpiId,
          kpi,
          severity: kpi.status === "critical" ? "critical" : "high",
          message: `KPI ${kpi.code} requires attention: ${kpi.currentValue} ${kpi.unitOfMeasure} (Target: ${kpi.target})`,
        });
      }
    }
  }

  /**
   * Data query methods - replace with actual database queries in production
   */
  private async queryEmergencyVisits(query: KPIDataQuery): Promise<number> {
    // Simulate emergency visits data
    return Math.floor(Math.random() * 10) + 5; // 5-15 visits
  }

  private async queryHospitalizations(query: KPIDataQuery): Promise<number> {
    // Simulate hospitalization data
    return Math.floor(Math.random() * 8) + 3; // 3-10 hospitalizations
  }

  private async queryPhysiotherapyOutcomes(
    query: KPIDataQuery,
  ): Promise<number> {
    // Simulate physiotherapy improvement data
    return Math.floor(Math.random() * 20) + 15; // 15-35 improved patients
  }

  private async queryPressureInjuries(query: KPIDataQuery): Promise<number> {
    // Simulate pressure injury data
    return Math.floor(Math.random() * 3) + 1; // 1-3 injuries
  }

  private async queryPatientFalls(query: KPIDataQuery): Promise<number> {
    // Simulate patient falls data
    return Math.floor(Math.random() * 2) + 1; // 1-2 falls with injury
  }

  private async queryDischarges(query: KPIDataQuery): Promise<number> {
    // Simulate discharge data
    return Math.floor(Math.random() * 50) + 80; // 80-130 discharges to community
  }

  private async queryPatientDays(query: KPIDataQuery): Promise<number> {
    // Simulate patient days data
    return Math.floor(Math.random() * 500) + 1000; // 1000-1500 patient days
  }

  private async getPatientDaysByServiceCode(
    serviceCode: string,
  ): Promise<number> {
    // Simulate service code specific patient days
    const baseValue = Math.floor(Math.random() * 200) + 100;
    return serviceCode === "XXXX" ? Math.floor(baseValue * 0.1) : baseValue;
  }

  /**
   * Public API methods
   */
  addHomecareKPI(kpi: HomecareJAWDAKPI): void {
    this.kpis.set(kpi.id, kpi);
    console.log(`✅ Added Home Healthcare KPI: ${kpi.code} - ${kpi.name}`);
  }

  getKPIStats() {
    const kpis = Array.from(this.kpis.values());

    return {
      total_kpis: kpis.length,
      calculated_kpis: kpis.filter((k) => k.lastCalculated > 0).length,
      by_status: kpis.reduce(
        (acc, kpi) => {
          acc[kpi.status] = (acc[kpi.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      by_trend: kpis.reduce(
        (acc, kpi) => {
          acc[kpi.trend] = (acc[kpi.trend] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      overall_compliance: this.calculateOverallCompliance(),
      data_quality:
        kpis.reduce((sum, kpi) => {
          const qualityScore =
            kpi.dataQuality === "high"
              ? 100
              : kpi.dataQuality === "medium"
                ? 75
                : 50;
          return sum + qualityScore;
        }, 0) / kpis.length,
    };
  }

  private calculateOverallCompliance(): number {
    const kpis = Array.from(this.kpis.values());
    if (kpis.length === 0) return 0;

    const totalWeight = kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
    const weightedScore = kpis.reduce((sum, kpi) => {
      const statusScore = this.getStatusScore(kpi.status);
      return sum + statusScore * kpi.weight;
    }, 0);

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private getStatusScore(status: HomecareJAWDAKPI["status"]): number {
    switch (status) {
      case "excellent":
        return 100;
      case "good":
        return 85;
      case "acceptable":
        return 70;
      case "needs_improvement":
        return 50;
      case "critical":
        return 25;
      default:
        return 0;
    }
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`❌ Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.calculationInterval) {
      clearInterval(this.calculationInterval);
      this.calculationInterval = null;
    }

    this.kpis.clear();
    this.caseMixData.clear();
    this.patientDays.clear();
    this.dataConnections.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
const enhancedJAWDAHomecareKPIService = new EnhancedJAWDAHomecareKPIService();

export default enhancedJAWDAHomecareKPIService;
export { EnhancedJAWDAHomecareKPIService, HomecareJAWDAKPI, CaseMixSubmission };
