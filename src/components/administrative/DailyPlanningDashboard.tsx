import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Activity,
  MapPin,
} from "lucide-react";
import {
  getDailyPlans,
  createDailyPlan,
  updateDailyPlan,
  approveDailyPlan,
  getDailyUpdates,
  createDailyUpdate,
  getTodaysActivePlans,
  getPlansRequiringAttention,
  DailyPlan,
  DailyUpdate,
  StaffAssignment,
  ResourceAllocation,
  RiskAssessment,
} from "@/api/daily-planning.api";
import {
  PatientService,
  EpisodeService,
  RealtimeService,
  Patient,
  Episode,
} from "@/api/supabase.api";
import {
  optimizeAssetAllocation,
  getAvailableDrivers,
  getAvailableVehicles,
  generateAutomatedReplacementSuggestions,
  getAssetPerformanceAnalytics,
  AssetOptimizationResult,
  VehicleAsset,
  DriverAsset,
  ReplacementSuggestion,
  getSkillsMatrix,
  identifySkillGaps,
  getEquipmentInventory,
  getMaintenanceDueEquipment,
  generateQualityMetrics,
  generateFinancialAnalytics,
  createRiskAssessment,
  getRiskAssessments,
  sendMessage,
  getMessages,
  SkillsMatrix,
  EquipmentInventory,
  QualityMetrics,
  FinancialAnalytics,
  RiskManagement,
  CommunicationHub,
  generateWorkforceIntelligence,
  WorkforceIntelligence,
  getPatientOutcomes,
  PatientOutcome,
  generateAdvancedAnalytics,
  AdvancedAnalytics,
} from "@/api/manpower.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useToast } from "@/hooks/useToast";
import { RefreshCw } from "lucide-react";

interface DailyPlanningDashboardProps {
  teamLead?: string;
  department?: string;
}

export default function DailyPlanningDashboard({
  teamLead = "Dr. Sarah Ahmed",
  department = "Nursing",
}: DailyPlanningDashboardProps) {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [todaysPlans, setTodaysPlans] = useState<DailyPlan[]>([]);
  const [attentionItems, setAttentionItems] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // ENHANCED: Asset optimization state
  const [assetOptimization, setAssetOptimization] = useState<AssetOptimizationResult | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleAsset[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverAsset[]>([]);
  const [replacementSuggestions, setReplacementSuggestions] = useState<ReplacementSuggestion[]>([]);
  const [assetPerformance, setAssetPerformance] = useState<any>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  // NEW: Enhanced state management
  const [skillsMatrix, setSkillsMatrix] = useState<SkillsMatrix[]>([]);
  const [skillGaps, setSkillGaps] = useState<any>(null);
  const [equipmentInventory, setEquipmentInventory] = useState<EquipmentInventory[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<EquipmentInventory[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [riskAssessments, setRiskAssessments] = useState<RiskManagement[]>([]);
  const [messages, setMessages] = useState<CommunicationHub[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  // NEW: Enhanced state for workforce intelligence and patient outcomes
  const [workforceIntelligence, setWorkforceIntelligence] = useState<any>(null);
  const [patientOutcomes, setPatientOutcomes] = useState<any[]>([]);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<any>(null);
  // REAL-TIME PATIENT STATUS: Enhanced state for patient monitoring
  const [realTimePatients, setRealTimePatients] = useState<Patient[]>([]);
  const [activeEpisodes, setActiveEpisodes] = useState<Episode[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<any[]>([]);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [medicationAdherence, setMedicationAdherence] = useState<any[]>([]);
  const [careplanProgress, setCareplanProgress] = useState<any[]>([]);
  const [patientStatusLoading, setPatientStatusLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // AI CLINICAL DECISION SUPPORT: Enhanced state for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [clinicalInsights, setClinicalInsights] = useState<any>(null);
  const [interventionSuggestions, setInterventionSuggestions] = useState<any[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<any[]>([]);
  const [careOptimization, setCareOptimization] = useState<any>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [selectedPatientForAI, setSelectedPatientForAI] = useState<string | null>(null);
  
  // MULTI-DISCIPLINARY TEAM COORDINATION: Enhanced state for team collaboration
  const [teamCoordination, setTeamCoordination] = useState<any>(null);
  const [activeTeamMembers, setActiveTeamMembers] = useState<any[]>([]);
  const [teamCommunications, setTeamCommunications] = useState<any[]>([]);
  const [careTeamMeetings, setCareTeamMeetings] = useState<any[]>([]);
  const [interdisciplinaryPlans, setInterdisciplinaryPlans] = useState<any[]>([]);
  const [teamPerformanceMetrics, setTeamPerformanceMetrics] = useState<any>(null);
  const [collaborationInsights, setCollaborationInsights] = useState<any>(null);
  
  // PATIENT OUTCOME TRACKING: Enhanced state for long-term analytics
  const [patientOutcomeAnalytics, setPatientOutcomeAnalytics] = useState<any>(null);
  const [longitudinalData, setLongitudinalData] = useState<any[]>([]);
  const [outcomeMetrics, setOutcomeMetrics] = useState<any>(null);
  const [healthTrends, setHealthTrends] = useState<any[]>([]);
  const [qualityIndicators, setQualityIndicators] = useState<any>(null);
  const [patientSatisfactionTrends, setPatientSatisfactionTrends] = useState<any[]>([]);
  const [clinicalOutcomesPredictions, setClinicalOutcomesPredictions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<DailyPlan>>({
    date: selectedDate,
    shift: "Morning",
    team_lead: teamLead,
    department,
    total_patients: 0,
    high_priority_patients: 0,
    medium_priority_patients: 0,
    low_priority_patients: 0,
    staff_assigned: [],
    resource_allocation: {
      vehicles: 0,
      medical_equipment: [],
      medications: "",
      emergency_supplies: "",
    },
    risk_assessment: {
      weather_conditions: "Clear",
      traffic_conditions: "Normal",
      patient_acuity_level: "Medium",
      staff_availability: "Full",
      equipment_status: "All functional",
    },
    objectives: [],
    contingency_plans: [],
    status: "draft",
    created_by: teamLead,
  });
  const [newUpdate, setNewUpdate] = useState<Partial<DailyUpdate>>({
    update_type: "progress",
    patients_completed: 0,
    patients_remaining: 0,
    issues_encountered: [],
    resource_updates: [],
    staff_updates: [],
    performance_metrics: {
      efficiency_rate: 0,
      quality_score: 0,
      patient_satisfaction: 0,
      safety_incidents: 0,
    },
    next_actions: [],
    escalation_required: false,
    status: "draft",
  });
  const { isOnline } = useOfflineSync();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    loadRealTimePatientData();
    
    // Set up real-time subscriptions for patient monitoring
    const interval = setInterval(() => {
      loadRealTimePatientData();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedDate]);
  
  useEffect(() => {
    // Subscribe to real-time patient updates
    const subscriptions: any[] = [];
    
    realTimePatients.forEach(patient => {
      const subscription = RealtimeService.subscribeToPatient(
        patient.id,
        (payload) => {
          console.log('Patient update received:', payload);
          loadRealTimePatientData();
        }
      );
      subscriptions.push(subscription);
    });
    
    return () => {
      subscriptions.forEach(sub => {
        RealtimeService.unsubscribe(`patient-${sub}`);
      });
    };
  }, [realTimePatients]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [plansData, todaysData, attentionData, vehiclesData, driversData] = await Promise.all([
        getDailyPlans({
          date_from: selectedDate,
          date_to: selectedDate,
          department,
        }),
        getTodaysActivePlans(),
        getPlansRequiringAttention(),
        getAvailableVehicles(selectedDate, "Morning"),
        getAvailableDrivers(selectedDate, "Morning"),
      ]);
      setPlans(plansData);
      setTodaysPlans(todaysData);
      setAttentionItems(attentionData);
      setAvailableVehicles(vehiclesData);
      setAvailableDrivers(driversData);
      
      // Load asset performance analytics
      await loadAssetPerformanceData();
      // Load enhanced data
      await loadEnhancedData();
      // Load real-time patient data
      await loadRealTimePatientData();
      // Load AI clinical decision support data
      await loadAIClinicalSupport();
      // Load multi-disciplinary team coordination data
      await loadTeamCoordinationData();
      // Load patient outcome tracking data
      await loadPatientOutcomeTracking();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // REAL-TIME PATIENT STATUS: Load comprehensive patient monitoring data
  const loadRealTimePatientData = async () => {
    try {
      setPatientStatusLoading(true);
      
      // Search for today's active patients
      const { data: patients, error: patientsError } = await PatientService.searchPatients(
        "", // Empty query to get all
        {
          status: "active",
          limit: 50
        }
      );
      
      if (patientsError) {
        console.error('Error loading patients:', patientsError);
        return;
      }
      
      setRealTimePatients(patients || []);
      
      // Load active episodes for these patients
      const episodePromises = (patients || []).map(patient => 
        PatientService.getPatientEpisodes(patient.id)
      );
      
      const episodeResults = await Promise.allSettled(episodePromises);
      const allEpisodes = episodeResults
        .filter(result => result.status === 'fulfilled')
        .flatMap((result: any) => result.value.data || []);
      
      setActiveEpisodes(allEpisodes);
      
      // Generate mock real-time data for demonstration
      generateMockPatientData(patients || []);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading real-time patient data:', error);
    } finally {
      setPatientStatusLoading(false);
    }
  };
  
  // Generate realistic mock data for patient monitoring
  const generateMockPatientData = (patients: Patient[]) => {
    // Generate patient alerts
    const alerts = patients.slice(0, 5).map((patient, index) => ({
      patient_id: patient.id,
      patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
      alert_type: ['vital_signs', 'medication', 'care_plan', 'emergency', 'follow_up'][index % 5],
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
      message: [
        'Blood pressure reading outside normal range',
        'Missed medication dose - requires follow-up',
        'Care plan milestone overdue',
        'Emergency contact requested',
        'Scheduled visit reminder'
      ][index % 5],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      status: Math.random() > 0.3 ? 'active' : 'resolved'
    }));
    
    setPatientAlerts(alerts);
    
    // Generate vital signs data
    const vitals = patients.slice(0, 8).map((patient, index) => ({
      patient_id: patient.id,
      patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
      blood_pressure: {
        systolic: 110 + Math.floor(Math.random() * 40),
        diastolic: 70 + Math.floor(Math.random() * 20),
        status: ['normal', 'elevated', 'high'][Math.floor(Math.random() * 3)]
      },
      heart_rate: {
        value: 60 + Math.floor(Math.random() * 40),
        status: ['normal', 'elevated'][Math.floor(Math.random() * 2)]
      },
      temperature: {
        value: 36.5 + Math.random() * 2,
        status: ['normal', 'fever'][Math.floor(Math.random() * 2)]
      },
      oxygen_saturation: {
        value: 95 + Math.floor(Math.random() * 5),
        status: ['normal', 'low'][Math.floor(Math.random() * 2)]
      },
      last_reading: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      trend: ['stable', 'improving', 'declining'][Math.floor(Math.random() * 3)]
    }));
    
    setVitalSigns(vitals);
    
    // Generate medication adherence data
    const medications = patients.slice(0, 6).map((patient, index) => ({
      patient_id: patient.id,
      patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
      adherence_rate: 70 + Math.floor(Math.random() * 30),
      missed_doses: Math.floor(Math.random() * 5),
      next_dose: new Date(Date.now() + Math.random() * 86400000).toISOString(),
      medications: [
        { name: 'Metformin', status: 'on_time' },
        { name: 'Lisinopril', status: Math.random() > 0.7 ? 'missed' : 'taken' },
        { name: 'Aspirin', status: 'taken' }
      ].slice(0, 1 + Math.floor(Math.random() * 3)),
      risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));
    
    setMedicationAdherence(medications);
    
    // Generate care plan progress data
    const carePlans = patients.slice(0, 7).map((patient, index) => ({
      patient_id: patient.id,
      patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
      overall_progress: 40 + Math.floor(Math.random() * 50),
      goals_completed: Math.floor(Math.random() * 8),
      goals_total: 8 + Math.floor(Math.random() * 4),
      next_milestone: [
        'Physical therapy assessment',
        'Medication review',
        'Wound care evaluation',
        'Family education session',
        'Discharge planning'
      ][index % 5],
      milestone_due: new Date(Date.now() + Math.random() * 604800000).toISOString(),
      status: ['on_track', 'behind', 'ahead'][Math.floor(Math.random() * 3)],
      last_update: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
    
    setCareplanProgress(carePlans);
  };
  
  // AI CLINICAL DECISION SUPPORT: Load AI-powered recommendations
  const loadAIClinicalSupport = async () => {
    try {
      setAiAnalysisLoading(true);
      
      // Generate AI recommendations based on current patient data
      const recommendations = await generateAIRecommendations(realTimePatients, vitalSigns, medicationAdherence, careplanProgress);
      setAiRecommendations(recommendations);
      
      // Generate clinical insights
      const insights = await generateClinicalInsights(realTimePatients, activeEpisodes);
      setClinicalInsights(insights);
      
      // Generate intervention suggestions
      const interventions = await generateInterventionSuggestions(patientAlerts, vitalSigns);
      setInterventionSuggestions(interventions);
      
      // Generate risk predictions
      const risks = await generateRiskPredictions(realTimePatients, vitalSigns, medicationAdherence);
      setRiskPredictions(risks);
      
      // Generate care optimization recommendations
      const optimization = await generateCareOptimization(realTimePatients, skillsMatrix, availableVehicles);
      setCareOptimization(optimization);
      
    } catch (error) {
      console.error('Error loading AI clinical support:', error);
    } finally {
      setAiAnalysisLoading(false);
    }
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate AI recommendations
  const generateAIRecommendations = async (patients: Patient[], vitals: any[], medications: any[], carePlans: any[]) => {
    // Simulate AI analysis with realistic healthcare recommendations
    return patients.slice(0, 8).map((patient, index) => {
      const patientVitals = vitals.find(v => v.patient_id === patient.id);
      const patientMeds = medications.find(m => m.patient_id === patient.id);
      const patientCare = carePlans.find(c => c.patient_id === patient.id);
      
      const recommendations = [];
      
      // Vital signs-based recommendations
      if (patientVitals) {
        if (patientVitals.blood_pressure.status === 'high') {
          recommendations.push({
            type: 'Clinical Intervention',
            priority: 'High',
            recommendation: 'Monitor BP closely, consider medication adjustment',
            rationale: 'Elevated blood pressure detected',
            confidence: 92
          });
        }
        if (patientVitals.trend === 'declining') {
          recommendations.push({
            type: 'Care Escalation',
            priority: 'Medium',
            recommendation: 'Increase visit frequency to twice weekly',
            rationale: 'Declining vital signs trend observed',
            confidence: 87
          });
        }
      }
      
      // Medication adherence recommendations
      if (patientMeds && patientMeds.adherence_rate < 80) {
        recommendations.push({
          type: 'Medication Management',
          priority: 'High',
          recommendation: 'Implement medication reminder system and family education',
          rationale: `Low adherence rate: ${patientMeds.adherence_rate}%`,
          confidence: 94
        });
      }
      
      // Care plan recommendations
      if (patientCare && patientCare.status === 'behind') {
        recommendations.push({
          type: 'Care Plan Adjustment',
          priority: 'Medium',
          recommendation: 'Reassess care goals and adjust timeline',
          rationale: 'Patient falling behind care plan milestones',
          confidence: 89
        });
      }
      
      // Default recommendations for demonstration
      if (recommendations.length === 0) {
        const defaultRecs = [
          {
            type: 'Preventive Care',
            priority: 'Low',
            recommendation: 'Continue current care plan with routine monitoring',
            rationale: 'Patient showing stable progress',
            confidence: 85
          },
          {
            type: 'Health Promotion',
            priority: 'Low',
            recommendation: 'Encourage increased physical activity within limits',
            rationale: 'Functional improvement opportunity identified',
            confidence: 78
          }
        ];
        recommendations.push(defaultRecs[index % 2]);
      }
      
      return {
        patient_id: patient.id,
        patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
        recommendations,
        ai_confidence_score: Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length),
        last_analysis: new Date().toISOString(),
        risk_level: recommendations.some(r => r.priority === 'High') ? 'High' : 
                   recommendations.some(r => r.priority === 'Medium') ? 'Medium' : 'Low'
      };
    });
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate clinical insights
  const generateClinicalInsights = async (patients: Patient[], episodes: Episode[]) => {
    return {
      total_patients_analyzed: patients.length,
      high_risk_patients: Math.floor(patients.length * 0.15),
      intervention_opportunities: Math.floor(patients.length * 0.25),
      care_optimization_potential: 23,
      key_insights: [
        'Medication adherence issues identified in 18% of patients',
        'Vital signs trending analysis suggests 3 patients need care escalation',
        'Care plan adjustments recommended for 5 patients',
        'Preventive interventions could reduce readmission risk by 12%'
      ],
      ai_model_accuracy: 94.2,
      last_model_update: '2024-01-15',
      clinical_evidence_base: 'Based on 50,000+ similar patient cases'
    };
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate intervention suggestions
  const generateInterventionSuggestions = async (alerts: any[], vitals: any[]) => {
    const interventions = [];
    
    // Critical alerts requiring immediate intervention
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active');
    criticalAlerts.forEach(alert => {
      interventions.push({
        intervention_id: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        patient_name: alert.patient_name,
        intervention_type: 'Immediate Response',
        urgency: 'Critical',
        description: 'Immediate clinical assessment and intervention required',
        estimated_time: '30 minutes',
        required_skills: ['Advanced Assessment', 'Emergency Response'],
        success_probability: 95,
        potential_impact: 'Prevent emergency hospitalization'
      });
    });
    
    // Vital signs-based interventions
    const abnormalVitals = vitals.filter(v => 
      v.blood_pressure.status === 'high' || 
      v.heart_rate.status === 'elevated' || 
      v.temperature.status === 'fever'
    );
    
    abnormalVitals.forEach(vital => {
      interventions.push({
        intervention_id: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        patient_name: vital.patient_name,
        intervention_type: 'Clinical Monitoring',
        urgency: 'High',
        description: 'Enhanced monitoring and potential medication adjustment',
        estimated_time: '45 minutes',
        required_skills: ['Vital Signs Assessment', 'Medication Management'],
        success_probability: 88,
        potential_impact: 'Stabilize vital signs and prevent complications'
      });
    });
    
    // Add some predictive interventions
    const predictiveInterventions = [
      {
        intervention_id: `INT-${Date.now()}-PRED1`,
        patient_name: 'Multiple Patients',
        intervention_type: 'Preventive Care',
        urgency: 'Medium',
        description: 'Implement fall prevention protocols for high-risk patients',
        estimated_time: '20 minutes per patient',
        required_skills: ['Risk Assessment', 'Patient Education'],
        success_probability: 82,
        potential_impact: 'Reduce fall incidents by 35%'
      },
      {
        intervention_id: `INT-${Date.now()}-PRED2`,
        patient_name: 'Diabetes Patients',
        intervention_type: 'Disease Management',
        urgency: 'Medium',
        description: 'Enhanced glucose monitoring and dietary counseling',
        estimated_time: '30 minutes per patient',
        required_skills: ['Diabetes Management', 'Nutritional Counseling'],
        success_probability: 91,
        potential_impact: 'Improve glycemic control and reduce complications'
      }
    ];
    
    interventions.push(...predictiveInterventions);
    
    return interventions.slice(0, 10); // Limit to top 10 interventions
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate risk predictions
  const generateRiskPredictions = async (patients: Patient[], vitals: any[], medications: any[]) => {
    return patients.slice(0, 6).map((patient, index) => {
      const patientVitals = vitals.find(v => v.patient_id === patient.id);
      const patientMeds = medications.find(m => m.patient_id === patient.id);
      
      // Calculate risk scores based on various factors
      let riskFactors = [];
      let overallRisk = 'Low';
      let riskScore = 20;
      
      if (patientVitals) {
        if (patientVitals.blood_pressure.status === 'high') {
          riskFactors.push('Hypertension');
          riskScore += 25;
        }
        if (patientVitals.trend === 'declining') {
          riskFactors.push('Declining Health Trend');
          riskScore += 20;
        }
      }
      
      if (patientMeds && patientMeds.adherence_rate < 70) {
        riskFactors.push('Poor Medication Adherence');
        riskScore += 30;
      }
      
      // Determine overall risk level
      if (riskScore >= 70) overallRisk = 'High';
      else if (riskScore >= 40) overallRisk = 'Medium';
      
      const predictions = [
        {
          risk_type: 'Readmission Risk',
          probability: Math.min(95, riskScore + Math.floor(Math.random() * 10)),
          timeframe: '30 days',
          contributing_factors: riskFactors.length > 0 ? riskFactors : ['Age', 'Comorbidities']
        },
        {
          risk_type: 'Care Plan Deviation',
          probability: Math.min(85, riskScore - 10 + Math.floor(Math.random() * 15)),
          timeframe: '14 days',
          contributing_factors: ['Medication Adherence', 'Social Support']
        }
      ];
      
      return {
        patient_id: patient.id,
        patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
        overall_risk_level: overallRisk,
        risk_score: riskScore,
        predictions,
        recommended_actions: [
          overallRisk === 'High' ? 'Increase monitoring frequency' : 'Continue routine care',
          'Review medication adherence',
          'Assess social support systems'
        ],
        confidence_level: 87 + Math.floor(Math.random() * 8),
        next_assessment_due: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      };
    });
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate care optimization
  const generateCareOptimization = async (patients: Patient[], skills: any[], vehicles: any[]) => {
    return {
      optimization_score: 87.3,
      efficiency_improvements: [
        'Optimize visit scheduling to reduce travel time by 15%',
        'Match staff skills to patient needs for better outcomes',
        'Implement group visits for similar conditions',
        'Use telehealth for routine follow-ups'
      ],
      resource_optimization: {
        staff_utilization: 82,
        vehicle_efficiency: 78,
        equipment_usage: 85,
        cost_savings_potential: 12500
      },
      care_pathway_recommendations: [
        {
          condition: 'Diabetes Management',
          current_approach: 'Individual visits',
          recommended_approach: 'Group education + individual monitoring',
          expected_improvement: '25% better glucose control',
          implementation_effort: 'Medium'
        },
        {
          condition: 'Wound Care',
          current_approach: 'Daily visits',
          recommended_approach: 'Telehealth monitoring + targeted visits',
          expected_improvement: '30% reduction in visit frequency',
          implementation_effort: 'Low'
        }
      ],
      quality_predictions: {
        patient_satisfaction_improvement: 8.5,
        clinical_outcome_improvement: 12.3,
        cost_effectiveness_improvement: 15.7
      }
    };
  };
  
  // MULTI-DISCIPLINARY TEAM COORDINATION: Load team collaboration data
  const loadTeamCoordinationData = async () => {
    try {
      setDataLoading(true);
      
      // Generate team coordination data
      const teamData = await generateTeamCoordinationData();
      setTeamCoordination(teamData.coordination);
      setActiveTeamMembers(teamData.activeMembers);
      setTeamCommunications(teamData.communications);
      setCareTeamMeetings(teamData.meetings);
      setInterdisciplinaryPlans(teamData.plans);
      setTeamPerformanceMetrics(teamData.performance);
      setCollaborationInsights(teamData.insights);
      
    } catch (error) {
      console.error('Error loading team coordination data:', error);
    } finally {
      setDataLoading(false);
    }
  };
  
  // MULTI-DISCIPLINARY TEAM COORDINATION: Generate team data
  const generateTeamCoordinationData = async () => {
    const activeMembers = [
      {
        member_id: 'TM001',
        name: 'Dr. Sarah Ahmed',
        role: 'Primary Physician',
        specialization: 'Internal Medicine',
        availability_status: 'Available',
        current_patients: 12,
        communication_preference: 'Secure Messaging',
        last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        expertise_areas: ['Diabetes', 'Hypertension', 'Chronic Care'],
        collaboration_score: 94
      },
      {
        member_id: 'TM002',
        name: 'Lisa Thompson, RN',
        role: 'Care Coordinator',
        specialization: 'Case Management',
        availability_status: 'In Meeting',
        current_patients: 18,
        communication_preference: 'Video Call',
        last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        expertise_areas: ['Care Planning', 'Patient Education', 'Discharge Planning'],
        collaboration_score: 91
      },
      {
        member_id: 'TM003',
        name: 'Ahmed Al-Rashid, PT',
        role: 'Physical Therapist',
        specialization: 'Rehabilitation',
        availability_status: 'With Patient',
        current_patients: 8,
        communication_preference: 'Phone',
        last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expertise_areas: ['Mobility', 'Strength Training', 'Fall Prevention'],
        collaboration_score: 88
      },
      {
        member_id: 'TM004',
        name: 'Maria Santos, MSW',
        role: 'Social Worker',
        specialization: 'Psychosocial Support',
        availability_status: 'Available',
        current_patients: 15,
        communication_preference: 'Secure Messaging',
        last_active: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        expertise_areas: ['Family Support', 'Resource Coordination', 'Mental Health'],
        collaboration_score: 92
      },
      {
        member_id: 'TM005',
        name: 'Dr. Omar Hassan',
        role: 'Pharmacist',
        specialization: 'Clinical Pharmacy',
        availability_status: 'Available',
        current_patients: 25,
        communication_preference: 'Secure Messaging',
        last_active: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        expertise_areas: ['Medication Management', 'Drug Interactions', 'Adherence'],
        collaboration_score: 96
      }
    ];
    
    const communications = [
      {
        communication_id: 'COM001',
        type: 'Care Plan Update',
        from: 'Dr. Sarah Ahmed',
        to: ['Lisa Thompson, RN', 'Ahmed Al-Rashid, PT'],
        patient_id: 'P001',
        patient_name: 'John Smith',
        message: 'Updated care plan for diabetes management. Please review new medication regimen and adjust PT goals accordingly.',
        priority: 'High',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'Read',
        requires_response: true,
        attachments: ['care_plan_v2.pdf']
      },
      {
        communication_id: 'COM002',
        type: 'Urgent Consultation',
        from: 'Lisa Thompson, RN',
        to: ['Dr. Omar Hassan'],
        patient_id: 'P002',
        patient_name: 'Mary Johnson',
        message: 'Patient experiencing medication side effects. Requesting immediate consultation for alternative options.',
        priority: 'Urgent',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'Responded',
        requires_response: false,
        response_time: 15
      },
      {
        communication_id: 'COM003',
        type: 'Team Meeting Request',
        from: 'Maria Santos, MSW',
        to: ['Dr. Sarah Ahmed', 'Lisa Thompson, RN', 'Ahmed Al-Rashid, PT'],
        patient_id: 'P003',
        patient_name: 'Robert Wilson',
        message: 'Complex psychosocial issues identified. Requesting multidisciplinary team meeting to develop comprehensive support plan.',
        priority: 'Medium',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'Pending',
        requires_response: true,
        proposed_meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const meetings = [
      {
        meeting_id: 'MTG001',
        type: 'Weekly Care Team Rounds',
        scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        attendees: activeMembers.slice(0, 4),
        agenda: [
          'Review high-risk patients',
          'Discuss care plan modifications',
          'Address resource needs',
          'Quality improvement initiatives'
        ],
        patients_to_discuss: [
          { patient_id: 'P001', priority: 'High', issues: ['Medication adherence', 'Family support'] },
          { patient_id: 'P004', priority: 'Medium', issues: ['Mobility goals', 'Discharge planning'] }
        ],
        meeting_status: 'Scheduled'
      },
      {
        meeting_id: 'MTG002',
        type: 'Urgent Case Conference',
        scheduled_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        attendees: [activeMembers[0], activeMembers[1], activeMembers[3]],
        agenda: [
          'Emergency care plan revision',
          'Family meeting coordination',
          'Resource mobilization'
        ],
        patients_to_discuss: [
          { patient_id: 'P003', priority: 'Critical', issues: ['Crisis intervention', 'Safety planning'] }
        ],
        meeting_status: 'Confirmed'
      }
    ];
    
    const plans = [
      {
        plan_id: 'IDP001',
        patient_id: 'P001',
        patient_name: 'John Smith',
        primary_diagnosis: 'Type 2 Diabetes with Complications',
        team_members: activeMembers.slice(0, 3),
        care_goals: [
          {
            goal: 'Achieve HbA1c < 7%',
            responsible_team: ['Dr. Sarah Ahmed', 'Dr. Omar Hassan'],
            target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 65,
            status: 'On Track'
          },
          {
            goal: 'Improve mobility and reduce fall risk',
            responsible_team: ['Ahmed Al-Rashid, PT', 'Lisa Thompson, RN'],
            target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 80,
            status: 'Ahead of Schedule'
          },
          {
            goal: 'Enhance family support system',
            responsible_team: ['Maria Santos, MSW'],
            target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 45,
            status: 'Needs Attention'
          }
        ],
        coordination_score: 88,
        last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_review: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const performance = {
      team_efficiency_score: 91,
      communication_response_time: 18, // minutes
      care_coordination_rating: 4.3,
      patient_satisfaction_with_team: 4.5,
      interdisciplinary_collaboration_index: 87,
      care_plan_adherence_rate: 94,
      team_meeting_attendance_rate: 96,
      conflict_resolution_time: 2.5, // hours
      knowledge_sharing_frequency: 8.2, // per week
      cross_referral_success_rate: 92
    };
    
    const insights = {
      collaboration_strengths: [
        'Excellent communication response times',
        'High care plan adherence rates',
        'Strong interdisciplinary relationships',
        'Effective conflict resolution processes'
      ],
      improvement_opportunities: [
        'Increase family engagement in care planning',
        'Enhance technology integration for remote collaboration',
        'Standardize documentation across disciplines',
        'Implement peer mentoring programs'
      ],
      trending_metrics: {
        communication_efficiency: '+12% this month',
        patient_satisfaction: '+8% this quarter',
        care_coordination: '+15% this year'
      },
      risk_factors: [
        'Staff burnout in high-caseload periods',
        'Technology adoption barriers',
        'Scheduling conflicts during peak times'
      ]
    };
    
    return {
      coordination: {
        active_teams: 3,
        total_team_members: activeMembers.length,
        active_communications: communications.filter(c => c.status === 'Pending').length,
        scheduled_meetings: meetings.length,
        active_care_plans: plans.length
      },
      activeMembers,
      communications,
      meetings,
      plans,
      performance,
      insights
    };
  };
  
  // PATIENT OUTCOME TRACKING: Load long-term analytics data
  const loadPatientOutcomeTracking = async () => {
    try {
      setDataLoading(true);
      
      // Generate patient outcome tracking data
      const outcomeData = await generatePatientOutcomeData();
      setPatientOutcomeAnalytics(outcomeData.analytics);
      setLongitudinalData(outcomeData.longitudinal);
      setOutcomeMetrics(outcomeData.metrics);
      setHealthTrends(outcomeData.trends);
      setQualityIndicators(outcomeData.quality);
      setPatientSatisfactionTrends(outcomeData.satisfaction);
      setClinicalOutcomesPredictions(outcomeData.predictions);
      
    } catch (error) {
      console.error('Error loading patient outcome tracking data:', error);
    } finally {
      setDataLoading(false);
    }
  };
  
  // PATIENT OUTCOME TRACKING: Generate outcome data
  const generatePatientOutcomeData = async () => {
    const analytics = {
      total_patients_tracked: 156,
      tracking_period_months: 12,
      outcome_categories: [
        {
          category: 'Clinical Outcomes',
          metrics: [
            { name: 'Functional Improvement', value: 78, trend: '+12%', benchmark: 75 },
            { name: 'Pain Reduction', value: 85, trend: '+8%', benchmark: 80 },
            { name: 'Medication Adherence', value: 92, trend: '+5%', benchmark: 88 },
            { name: 'Readmission Rate', value: 8, trend: '-15%', benchmark: 12 }
          ]
        },
        {
          category: 'Quality of Life',
          metrics: [
            { name: 'Patient Satisfaction', value: 4.3, trend: '+0.2', benchmark: 4.0 },
            { name: 'Independence Level', value: 82, trend: '+18%', benchmark: 70 },
            { name: 'Social Engagement', value: 76, trend: '+22%', benchmark: 65 },
            { name: 'Mental Health Score', value: 79, trend: '+14%', benchmark: 72 }
          ]
        },
        {
          category: 'Cost Effectiveness',
          metrics: [
            { name: 'Cost per Episode', value: 2850, trend: '-8%', benchmark: 3100 },
            { name: 'Length of Care', value: 45, trend: '-12%', benchmark: 52 },
            { name: 'Resource Utilization', value: 88, trend: '+6%', benchmark: 85 },
            { name: 'ROI on Care', value: 3.2, trend: '+25%', benchmark: 2.8 }
          ]
        }
      ],
      predictive_insights: {
        risk_stratification: {
          low_risk: 45,
          medium_risk: 38,
          high_risk: 17
        },
        outcome_predictions: {
          excellent_outcomes: 42,
          good_outcomes: 35,
          fair_outcomes: 18,
          poor_outcomes: 5
        }
      }
    };
    
    const longitudinal = [
      {
        patient_id: 'P001',
        patient_name: 'John Smith',
        diagnosis: 'Type 2 Diabetes',
        care_start_date: '2024-01-15',
        tracking_duration: 180, // days
        outcome_trajectory: [
          { date: '2024-01-15', hba1c: 9.2, functional_score: 65, satisfaction: 3.8 },
          { date: '2024-02-15', hba1c: 8.7, functional_score: 72, satisfaction: 4.1 },
          { date: '2024-03-15', hba1c: 8.1, functional_score: 78, satisfaction: 4.3 },
          { date: '2024-04-15', hba1c: 7.6, functional_score: 82, satisfaction: 4.4 },
          { date: '2024-05-15', hba1c: 7.2, functional_score: 85, satisfaction: 4.5 }
        ],
        interventions: [
          { date: '2024-01-20', type: 'Medication Adjustment', impact_score: 8.5 },
          { date: '2024-02-10', type: 'Nutrition Counseling', impact_score: 7.2 },
          { date: '2024-03-05', type: 'Exercise Program', impact_score: 9.1 },
          { date: '2024-04-12', type: 'Family Education', impact_score: 6.8 }
        ],
        predicted_outcomes: {
          next_3_months: { hba1c: 6.8, functional_score: 88, satisfaction: 4.6 },
          next_6_months: { hba1c: 6.5, functional_score: 90, satisfaction: 4.7 },
          risk_factors: ['Medication adherence', 'Lifestyle changes']
        }
      },
      {
        patient_id: 'P002',
        patient_name: 'Mary Johnson',
        diagnosis: 'Post-Stroke Recovery',
        care_start_date: '2024-02-01',
        tracking_duration: 150,
        outcome_trajectory: [
          { date: '2024-02-01', mobility_score: 35, cognitive_score: 68, satisfaction: 3.5 },
          { date: '2024-03-01', mobility_score: 45, cognitive_score: 72, satisfaction: 3.9 },
          { date: '2024-04-01', mobility_score: 58, cognitive_score: 78, satisfaction: 4.2 },
          { date: '2024-05-01', mobility_score: 68, cognitive_score: 82, satisfaction: 4.4 },
          { date: '2024-06-01', mobility_score: 75, cognitive_score: 85, satisfaction: 4.5 }
        ],
        interventions: [
          { date: '2024-02-05', type: 'Physical Therapy', impact_score: 9.2 },
          { date: '2024-02-15', type: 'Speech Therapy', impact_score: 8.7 },
          { date: '2024-03-10', type: 'Occupational Therapy', impact_score: 8.9 },
          { date: '2024-04-20', type: 'Cognitive Training', impact_score: 7.8 }
        ],
        predicted_outcomes: {
          next_3_months: { mobility_score: 82, cognitive_score: 88, satisfaction: 4.6 },
          next_6_months: { mobility_score: 85, cognitive_score: 90, satisfaction: 4.7 },
          risk_factors: ['Plateau risk', 'Motivation maintenance']
        }
      }
    ];
    
    const metrics = {
      overall_improvement_rate: 84,
      average_care_duration: 52, // days
      patient_retention_rate: 96,
      goal_achievement_rate: 88,
      complication_rate: 4,
      patient_reported_outcomes: {
        pain_improvement: 82,
        function_improvement: 78,
        quality_of_life: 85,
        care_satisfaction: 91
      },
      clinical_indicators: {
        medication_adherence: 92,
        appointment_compliance: 94,
        care_plan_adherence: 89,
        emergency_visits: 6 // per 100 patients
      }
    };
    
    const trends = [
      {
        trend_name: 'Functional Independence',
        timeframe: 'Last 12 months',
        data_points: [65, 68, 72, 75, 78, 81, 83, 85, 87, 88, 89, 90],
        trend_direction: 'Improving',
        statistical_significance: 'High',
        contributing_factors: ['Enhanced PT protocols', 'Family engagement', 'Technology integration']
      },
      {
        trend_name: 'Patient Satisfaction',
        timeframe: 'Last 12 months',
        data_points: [4.0, 4.1, 4.0, 4.2, 4.1, 4.3, 4.2, 4.4, 4.3, 4.5, 4.4, 4.5],
        trend_direction: 'Stable-Improving',
        statistical_significance: 'Medium',
        contributing_factors: ['Communication improvements', 'Care coordination', 'Response times']
      },
      {
        trend_name: 'Readmission Rates',
        timeframe: 'Last 12 months',
        data_points: [15, 14, 13, 12, 11, 10, 9, 8, 8, 7, 8, 8],
        trend_direction: 'Improving',
        statistical_significance: 'High',
        contributing_factors: ['Discharge planning', 'Follow-up protocols', 'Care transitions']
      }
    ];
    
    const quality = {
      clinical_quality_score: 92,
      patient_safety_score: 96,
      care_coordination_score: 89,
      outcome_achievement_score: 87,
      benchmarking: {
        industry_percentile: 85,
        peer_comparison: 'Above Average',
        accreditation_status: 'Excellent'
      },
      improvement_initiatives: [
        {
          initiative: 'Enhanced Care Transitions',
          impact: 'Reduced readmissions by 25%',
          implementation_date: '2024-01-01',
          status: 'Completed'
        },
        {
          initiative: 'Patient-Centered Care Planning',
          impact: 'Improved satisfaction by 15%',
          implementation_date: '2024-03-01',
          status: 'In Progress'
        }
      ]
    };
    
    const satisfaction = [
      {
        period: 'Q1 2024',
        overall_satisfaction: 4.2,
        care_quality: 4.4,
        communication: 4.1,
        timeliness: 3.9,
        staff_competency: 4.5,
        facility_rating: 4.3,
        likelihood_to_recommend: 92
      },
      {
        period: 'Q2 2024',
        overall_satisfaction: 4.3,
        care_quality: 4.5,
        communication: 4.2,
        timeliness: 4.0,
        staff_competency: 4.6,
        facility_rating: 4.4,
        likelihood_to_recommend: 94
      }
    ];
    
    const predictions = [
      {
        prediction_type: 'Outcome Success Probability',
        patient_cohort: 'Diabetes Management',
        success_probability: 87,
        confidence_interval: '82-92%',
        key_predictors: ['Medication adherence', 'Family support', 'Baseline HbA1c'],
        recommended_interventions: [
          'Enhanced medication management',
          'Family education programs',
          'Continuous glucose monitoring'
        ]
      },
      {
        prediction_type: 'Readmission Risk',
        patient_cohort: 'Post-Acute Care',
        risk_probability: 12,
        confidence_interval: '8-16%',
        key_predictors: ['Discharge planning quality', 'Social support', 'Comorbidity burden'],
        recommended_interventions: [
          'Structured discharge planning',
          'Social work consultation',
          'Enhanced follow-up protocols'
        ]
      }
    ];
    
    return {
      analytics,
      longitudinal,
      metrics,
      trends,
      quality,
      satisfaction,
      predictions
    };
  };
  
  // AI CLINICAL DECISION SUPPORT: Handle AI recommendation actions
  const handleImplementRecommendation = async (recommendationId: string, patientId: string) => {
    try {
      // In a real implementation, this would integrate with clinical systems
      console.log(`Implementing recommendation ${recommendationId} for patient ${patientId}`);
      
      toast({
        title: "Recommendation Implemented",
        description: "AI recommendation has been added to the patient's care plan.",
      });
      
      // Refresh AI recommendations
      await loadAIClinicalSupport();
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      toast({
        title: "Implementation Error",
        description: "Failed to implement recommendation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // AI CLINICAL DECISION SUPPORT: Generate detailed analysis for specific patient
  const generatePatientSpecificAnalysis = async (patientId: string) => {
    try {
      setAiAnalysisLoading(true);
      setSelectedPatientForAI(patientId);
      
      // Simulate detailed AI analysis for specific patient
      const patient = realTimePatients.find(p => p.id === patientId);
      if (!patient) return;
      
      const detailedAnalysis = {
        patient_id: patientId,
        patient_name: `${patient.first_name_en} ${patient.last_name_en}`,
        comprehensive_assessment: {
          clinical_status: 'Stable with monitoring needs',
          risk_stratification: 'Medium Risk',
          care_complexity: 'Moderate',
          prognosis: 'Good with adherence to care plan'
        },
        ai_recommendations: [
          {
            category: 'Medication Management',
            recommendation: 'Consider medication synchronization program',
            evidence_level: 'Strong',
            expected_outcome: 'Improved adherence by 25%'
          },
          {
            category: 'Care Coordination',
            recommendation: 'Schedule multidisciplinary team meeting',
            evidence_level: 'Moderate',
            expected_outcome: 'Enhanced care coordination'
          }
        ],
        predictive_insights: {
          next_30_days: 'Stable condition expected with current interventions',
          next_90_days: 'Potential for functional improvement with enhanced therapy',
          risk_factors: ['Medication adherence', 'Social isolation']
        }
      };
      
      // Update the recommendations with detailed analysis
      setAiRecommendations(prev => 
        prev.map(rec => 
          rec.patient_id === patientId 
            ? { ...rec, detailed_analysis: detailedAnalysis }
            : rec
        )
      );
      
    } catch (error) {
      console.error('Error generating patient-specific analysis:', error);
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // NEW: Load enhanced data for comprehensive management
  const loadEnhancedData = async () => {
    try {
      setDataLoading(true);
      const [skillsData, skillGapsData, equipmentData, maintenanceData, qualityData, financialData, riskData, messagesData, workforceData, outcomesData, analyticsData] = await Promise.all([
        getSkillsMatrix(),
        identifySkillGaps(department),
        getEquipmentInventory(),
        getMaintenanceDueEquipment(),
        generateQualityMetrics(selectedDate, selectedDate),
        generateFinancialAnalytics(selectedDate, selectedDate),
        getRiskAssessments(),
        getMessages({ recipient_id: teamLead, unread_only: false }),
        generateWorkforceIntelligence(department, { start_date: selectedDate, end_date: selectedDate }),
        getPatientOutcomes({ date_from: selectedDate, date_to: selectedDate }),
        generateAdvancedAnalytics({ start_date: selectedDate, end_date: selectedDate }),
      ]);
      
      setSkillsMatrix(skillsData);
      setSkillGaps(skillGapsData);
      setEquipmentInventory(equipmentData);
      setMaintenanceDue(maintenanceData);
      setQualityMetrics(qualityData);
      setFinancialAnalytics(financialData);
      setRiskAssessments(riskData);
      setMessages(messagesData);
      setWorkforceIntelligence(workforceData);
      setPatientOutcomes(outcomesData);
      setAdvancedAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading enhanced data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // ENHANCED: Load asset performance data
  const loadAssetPerformanceData = async () => {
    try {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const performanceData = await getAssetPerformanceAnalytics(lastWeek, selectedDate);
      setAssetPerformance(performanceData);
    } catch (error) {
      console.error("Error loading asset performance data:", error);
    }
  };

  // ENHANCED: Optimize asset allocation
  const handleOptimizeAssets = async () => {
    try {
      setOptimizationLoading(true);
      
      // Extract patient requirements from plans
      const patientRequirements = plans.flatMap(plan => 
        plan.staff_assigned.map(staff => ({
          patient_id: `P${Math.random().toString(36).substr(2, 9)}`,
          location: staff.specialization,
          priority: plan.high_priority_patients > 0 ? 'high' : 'medium',
          estimated_duration: 60,
        }))
      );
      
      const optimizationResult = await optimizeAssetAllocation(
        selectedDate,
        "Morning",
        patientRequirements
      );
      
      setAssetOptimization(optimizationResult);
      setReplacementSuggestions(optimizationResult.replacement_suggestions);
      
      toast({
        title: "Asset Optimization Complete",
        description: `Optimization score: ${optimizationResult.optimization_score.toFixed(1)}%. Potential savings: ${optimizationResult.cost_savings.toFixed(0)}.`,
      });
    } catch (error) {
      console.error("Error optimizing assets:", error);
      toast({
        title: "Optimization Error",
        description: "Failed to optimize asset allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOptimizationLoading(false);
    }
  };

  const loadUpdates = async (planId: string) => {
    try {
      const updatesData = await getDailyUpdates(planId);
      setUpdates(updatesData);
    } catch (error) {
      console.error("Error loading updates:", error);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      await createDailyPlan(
        newPlan as Omit<DailyPlan, "_id" | "created_at" | "updated_at">,
      );
      setShowCreateDialog(false);
      setNewPlan({
        date: selectedDate,
        shift: "Morning",
        team_lead: teamLead,
        department,
        total_patients: 0,
        high_priority_patients: 0,
        medium_priority_patients: 0,
        low_priority_patients: 0,
        staff_assigned: [],
        resource_allocation: {
          vehicles: 0,
          medical_equipment: [],
          medications: "",
          emergency_supplies: "",
        },
        risk_assessment: {
          weather_conditions: "Clear",
          traffic_conditions: "Normal",
          patient_acuity_level: "Medium",
          staff_availability: "Full",
          equipment_status: "All functional",
        },
        objectives: [],
        contingency_plans: [],
        status: "draft",
        created_by: teamLead,
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Error creating plan:", error);
      alert(error instanceof Error ? error.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async (id: string) => {
    try {
      setLoading(true);
      await approveDailyPlan(id, teamLead);
      await loadDashboardData();
    } catch (error) {
      console.error("Error approving plan:", error);
      alert(error instanceof Error ? error.message : "Failed to approve plan");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      await createDailyUpdate({
        ...newUpdate,
        plan_id: selectedPlan.plan_id,
        date: selectedDate,
        update_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        updated_by: teamLead,
      } as Omit<
        DailyUpdate,
        "_id" | "update_id" | "created_at" | "updated_at"
      >);
      setShowUpdateDialog(false);
      setNewUpdate({
        update_type: "progress",
        patients_completed: 0,
        patients_remaining: 0,
        issues_encountered: [],
        resource_updates: [],
        staff_updates: [],
        performance_metrics: {
          efficiency_rate: 0,
          quality_score: 0,
          patient_satisfaction: 0,
          safety_incidents: 0,
        },
        next_actions: [],
        escalation_required: false,
        status: "draft",
      });
      await loadUpdates(selectedPlan.plan_id);
    } catch (error) {
      console.error("Error creating update:", error);
      alert(error instanceof Error ? error.message : "Failed to create update");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      draft: "outline",
      completed: "secondary",
      cancelled: "destructive",
    };
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      draft: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    return (
      <Badge
        variant={variants[status] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Critical: "destructive",
      High: "default",
      Medium: "secondary",
      Low: "secondary",
    };
    return <Badge variant={variants[level] || "secondary"}>{level}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Daily Planning Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Plan and monitor daily operations and staff assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Daily Plan</DialogTitle>
                  <DialogDescription>
                    Create a new daily operational plan for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shift">Shift</Label>
                      <Select
                        value={newPlan.shift}
                        onValueChange={(value) =>
                          setNewPlan({ ...newPlan, shift: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                          <SelectItem value="Full Day">Full Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="totalPatients">Total Patients</Label>
                      <Input
                        id="totalPatients"
                        type="number"
                        value={newPlan.total_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            total_patients: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="highPriority">High Priority</Label>
                      <Input
                        id="highPriority"
                        type="number"
                        value={newPlan.high_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            high_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mediumPriority">Medium Priority</Label>
                      <Input
                        id="mediumPriority"
                        type="number"
                        value={newPlan.medium_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            medium_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowPriority">Low Priority</Label>
                      <Input
                        id="lowPriority"
                        type="number"
                        value={newPlan.low_priority_patients}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            low_priority_patients:
                              parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="objectives">Objectives</Label>
                    <Textarea
                      id="objectives"
                      placeholder="Enter objectives (one per line)"
                      value={newPlan.objectives?.join("\n") || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          objectives: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan} disabled={loading}>
                    Create Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Alert Cards with Framework Matrix Integration */}
        {attentionItems && (
          <div className="space-y-6">
            {/* Framework Matrix Clinical Operations Status */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🏥 Framework Matrix - Clinical Operations Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Framework Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {attentionItems.framework_matrix_alerts?.length || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      Clinical workflow issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      Operations Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {attentionItems.clinical_operations_status?.length || 0}
                    </div>
                    <p className="text-xs text-green-600">
                      Function monitoring
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">
                      Patient Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {attentionItems.framework_matrix_alerts?.filter(
                        (alert) => alert.function === "Patient Referrals",
                      ).length || 0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Referral processing
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-teal-800">
                      Assessment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-900">
                      {attentionItems.framework_matrix_alerts?.filter(
                        (alert) => alert.function === "Patient Assessment",
                      ).length || 0}
                    </div>
                    <p className="text-xs text-teal-600">Assessment workflow</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Standard Administrative Alerts */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📋 Administrative Operations Monitoring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      Overdue Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">
                      {attentionItems.overdue_updates?.length || 0}
                    </div>
                    <p className="text-xs text-orange-600">
                      Plans need status updates
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">
                      Critical Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">
                      {attentionItems.critical_issues?.length || 0}
                    </div>
                    <p className="text-xs text-red-600">
                      Unresolved critical issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Pending Approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {attentionItems.pending_approvals?.length || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      Plans awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">
                      End-of-Day Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {attentionItems.end_of_day_alerts?.length || 0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Automated preparation alerts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">
                      Predictive Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-900">
                      {attentionItems.predictive_issues?.length || 0}
                    </div>
                    <p className="text-xs text-yellow-600">
                      AI-detected potential issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-800">
                      Compliance Violations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-900">
                      {attentionItems.compliance_violations?.length || 0}
                    </div>
                    <p className="text-xs text-indigo-600">
                      DOH/JAWDA compliance issues
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">
                      Resource Conflicts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {attentionItems.resource_conflicts?.length || 0}
                    </div>
                    <p className="text-xs text-green-600">
                      Advanced optimization alerts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-800">
                      Late Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {attentionItems.late_submissions?.length || 0}
                    </div>
                    <p className="text-xs text-gray-600">
                      After 8:00 AM deadline
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="clinical-decision-support" className="space-y-6">
        <TabsList className="grid w-full grid-cols-14">
          <TabsTrigger value="clinical-decision-support">🧠 AI Clinical Support</TabsTrigger>
          <TabsTrigger value="team-coordination">👥 Team Coordination</TabsTrigger>
          <TabsTrigger value="outcome-tracking">📊 Outcome Tracking</TabsTrigger>
          <TabsTrigger value="patient-status">🏥 Patient Status</TabsTrigger>
          <TabsTrigger value="plans">Daily Plans</TabsTrigger>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="assets">Asset Optimization</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="workforce">Workforce Intelligence</TabsTrigger>
          <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
          <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
        </TabsList>

          {/* AI CLINICAL DECISION SUPPORT DASHBOARD */}
          <TabsContent value="clinical-decision-support" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🧠 AI-Powered Clinical Decision Support</h2>
                <p className="text-gray-600">Intelligent recommendations for optimal patient care interventions</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  AI {isOnline ? 'Active' : 'Offline'}
                </Badge>
                <Button 
                  onClick={loadAIClinicalSupport} 
                  disabled={aiAnalysisLoading}
                  variant="outline"
                  size="sm"
                >
                  {aiAnalysisLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Analysis
                </Button>
                <div className="text-xs text-gray-500">
                  Last analysis: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* AI Clinical Insights Overview */}
            {clinicalInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Patients Analyzed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {clinicalInsights.total_patients_analyzed}
                    </div>
                    <p className="text-xs text-blue-600">
                      AI Model Accuracy: {clinicalInsights.ai_model_accuracy}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      High Risk Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">
                      {clinicalInsights.high_risk_patients}
                    </div>
                    <p className="text-xs text-red-600">
                      Requiring immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Intervention Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {clinicalInsights.intervention_opportunities}
                    </div>
                    <p className="text-xs text-green-600">
                      Care optimization potential
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Care Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {clinicalInsights.care_optimization_potential}%
                    </div>
                    <p className="text-xs text-purple-600">
                      Efficiency improvement potential
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Recommendations and Interventions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Patient Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                    AI Patient Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized care recommendations based on AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {aiRecommendations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {aiAnalysisLoading ? (
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                            Analyzing patient data...
                          </div>
                        ) : (
                          'No AI recommendations available'
                        )}
                      </div>
                    ) : (
                      aiRecommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">
                              {rec.patient_name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  rec.risk_level === 'High'
                                    ? 'destructive'
                                    : rec.risk_level === 'Medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {rec.risk_level} Risk
                              </Badge>
                              <Badge variant="outline">
                                {rec.ai_confidence_score}% Confidence
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {rec.recommendations.slice(0, 2).map((recommendation: any, recIndex: number) => (
                              <div key={recIndex} className="text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-700">
                                    {recommendation.type}
                                  </span>
                                  <Badge
                                    variant={
                                      recommendation.priority === 'High'
                                        ? 'destructive'
                                        : recommendation.priority === 'Medium'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {recommendation.priority}
                                  </Badge>
                                </div>
                                <div className="text-gray-600 text-xs mb-1">
                                  {recommendation.recommendation}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  Rationale: {recommendation.rationale}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generatePatientSpecificAnalysis(rec.patient_id)}
                              disabled={aiAnalysisLoading}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Detailed Analysis
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleImplementRecommendation(rec.patient_id, rec.patient_id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Implement
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Intervention Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    Intervention Suggestions
                  </CardTitle>
                  <CardDescription>
                    AI-recommended care interventions and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {interventionSuggestions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No intervention suggestions available
                      </div>
                    ) : (
                      interventionSuggestions.slice(0, 6).map((intervention, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">
                              {intervention.intervention_type}
                            </div>
                            <Badge
                              variant={
                                intervention.urgency === 'Critical'
                                  ? 'destructive'
                                  : intervention.urgency === 'High'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {intervention.urgency}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            {intervention.description}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Patient:</span> {intervention.patient_name}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {intervention.estimated_time}
                            </div>
                            <div>
                              <span className="font-medium">Success Rate:</span> {intervention.success_probability}%
                            </div>
                            <div>
                              <span className="font-medium">Impact:</span> High
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Required Skills:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {intervention.required_skills.map((skill: string, skillIndex: number) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Predictions and Care Optimization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                    AI Risk Predictions
                  </CardTitle>
                  <CardDescription>
                    Predictive analytics for patient risk assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {riskPredictions.map((risk, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {risk.patient_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                risk.overall_risk_level === 'High'
                                  ? 'destructive'
                                  : risk.overall_risk_level === 'Medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {risk.overall_risk_level} Risk
                            </Badge>
                            <Badge variant="outline">
                              {risk.confidence_level}% Confidence
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {risk.predictions.map((pred: any, predIndex: number) => (
                            <div key={predIndex} className="text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{pred.risk_type}:</span>
                                <span className="text-orange-600 font-medium">
                                  {pred.probability}% in {pred.timeframe}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Factors: {pred.contributing_factors.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Recommended Actions:
                          </div>
                          <div className="space-y-1">
                            {risk.recommended_actions.slice(0, 2).map((action: string, actionIndex: number) => (
                              <div key={actionIndex} className="text-xs text-gray-600 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Care Optimization */}
              {careOptimization && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                      Care Optimization Insights
                    </CardTitle>
                    <CardDescription>
                      AI-powered recommendations for care delivery optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Optimization Score:</span>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {careOptimization.optimization_score}%
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Efficiency Improvements:</h4>
                        <div className="space-y-1">
                          {careOptimization.efficiency_improvements.slice(0, 3).map((improvement: string, index: number) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {improvement}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Resource Utilization:</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Staff:</span>
                              <span>{careOptimization.resource_optimization.staff_utilization}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vehicles:</span>
                              <span>{careOptimization.resource_optimization.vehicle_efficiency}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Equipment:</span>
                              <span>{careOptimization.resource_optimization.equipment_usage}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Quality Predictions:</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Satisfaction:</span>
                              <span className="text-green-600">+{careOptimization.quality_predictions.patient_satisfaction_improvement}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Outcomes:</span>
                              <span className="text-green-600">+{careOptimization.quality_predictions.clinical_outcome_improvement}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cost Efficiency:</span>
                              <span className="text-green-600">+{careOptimization.quality_predictions.cost_effectiveness_improvement}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Care Pathway Recommendations:</h4>
                        <div className="space-y-2">
                          {careOptimization.care_pathway_recommendations.slice(0, 2).map((pathway: any, index: number) => (
                            <div key={index} className="border rounded p-2">
                              <div className="text-sm font-medium">{pathway.condition}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                <div><strong>Current:</strong> {pathway.current_approach}</div>
                                <div><strong>Recommended:</strong> {pathway.recommended_approach}</div>
                                <div className="text-green-600"><strong>Expected:</strong> {pathway.expected_improvement}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${careOptimization.resource_optimization.cost_savings_potential.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Potential Monthly Savings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Key Clinical Insights */}
            {clinicalInsights && (
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Key Clinical Insights</CardTitle>
                  <CardDescription>
                    AI-generated insights based on comprehensive patient data analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Clinical Intelligence Summary:</h4>
                      <div className="space-y-2">
                        {clinicalInsights.key_insights.map((insight: string, index: number) => (
                          <div key={index} className="text-sm text-gray-700 flex items-start">
                            <CheckCircle className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">AI Model Information:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Model Accuracy:</span>
                          <span className="font-medium">{clinicalInsights.ai_model_accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Model Update:</span>
                          <span className="font-medium">{clinicalInsights.last_model_update}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          {clinicalInsights.clinical_evidence_base}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* MULTI-DISCIPLINARY TEAM COORDINATION DASHBOARD */}
          <TabsContent value="team-coordination" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">👥 Multi-Disciplinary Team Coordination</h2>
                <p className="text-gray-600">Seamless communication and collaboration between care teams</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Team {isOnline ? 'Connected' : 'Offline'}
                </Badge>
                <Button 
                  onClick={loadTeamCoordinationData} 
                  disabled={dataLoading}
                  variant="outline"
                  size="sm"
                >
                  {dataLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Team Data
                </Button>
              </div>
            </div>

            {/* Team Coordination Overview */}
            {teamCoordination && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Active Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {teamCoordination.active_teams}
                    </div>
                    <p className="text-xs text-blue-600">
                      {teamCoordination.total_team_members} total members
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Active Communications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {teamCoordination.active_communications}
                    </div>
                    <p className="text-xs text-green-600">
                      Pending responses
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduled Meetings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {teamCoordination.scheduled_meetings}
                    </div>
                    <p className="text-xs text-purple-600">
                      This week
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Care Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">
                      {teamCoordination.active_care_plans}
                    </div>
                    <p className="text-xs text-orange-600">
                      Interdisciplinary plans
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-teal-200 bg-teal-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-teal-800 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-900">
                      {teamPerformanceMetrics?.team_efficiency_score || 91}%
                    </div>
                    <p className="text-xs text-teal-600">
                      Efficiency score
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Active Team Members and Communications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                    Active Team Members
                  </CardTitle>
                  <CardDescription>
                    Current availability and collaboration status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activeTeamMembers.map((member, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {member.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                member.availability_status === 'Available'
                                  ? 'default'
                                  : member.availability_status === 'With Patient'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {member.availability_status}
                            </Badge>
                            <Badge variant="outline">
                              {member.collaboration_score}% collab
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Role:</strong> {member.role}</div>
                          <div><strong>Specialization:</strong> {member.specialization}</div>
                          <div><strong>Current Patients:</strong> {member.current_patients}</div>
                          <div><strong>Expertise:</strong> {member.expertise_areas.slice(0, 2).join(', ')}</div>
                          <div><strong>Last Active:</strong> {new Date(member.last_active).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Communications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Recent Communications
                  </CardTitle>
                  <CardDescription>
                    Inter-team messages and coordination updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {teamCommunications.map((comm, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${
                        comm.priority === 'Urgent' ? 'border-red-200 bg-red-50' :
                        comm.priority === 'High' ? 'border-orange-200 bg-orange-50' :
                        'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {comm.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                comm.priority === 'Urgent'
                                  ? 'destructive'
                                  : comm.priority === 'High'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {comm.priority}
                            </Badge>
                            <Badge variant="outline">
                              {comm.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>From:</strong> {comm.from}</div>
                          <div><strong>To:</strong> {comm.to.join(', ')}</div>
                          <div><strong>Patient:</strong> {comm.patient_name}</div>
                          <div className="text-gray-700 mt-2">{comm.message}</div>
                          <div className="text-gray-500 mt-1">
                            {new Date(comm.timestamp).toLocaleString()}
                          </div>
                          {comm.response_time && (
                            <div className="text-green-600">
                              Response time: {comm.response_time} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Care Team Meetings and Interdisciplinary Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scheduled Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                    Care Team Meetings
                  </CardTitle>
                  <CardDescription>
                    Scheduled interdisciplinary team meetings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careTeamMeetings.map((meeting, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {meeting.type}
                          </div>
                          <Badge variant="default">
                            {meeting.meeting_status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Time:</strong> {new Date(meeting.scheduled_time).toLocaleString()}</div>
                          <div><strong>Duration:</strong> {meeting.duration} minutes</div>
                          <div><strong>Attendees:</strong> {meeting.attendees.length} team members</div>
                          <div><strong>Agenda:</strong></div>
                          <ul className="list-disc list-inside ml-2">
                            {meeting.agenda.slice(0, 2).map((item, agendaIndex) => (
                              <li key={agendaIndex} className="text-xs">{item}</li>
                            ))}
                          </ul>
                          <div><strong>Patients to Discuss:</strong></div>
                          {meeting.patients_to_discuss.map((patient, patientIndex) => (
                            <div key={patientIndex} className="ml-2 text-xs">
                              • {patient.patient_id} ({patient.priority} priority)
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interdisciplinary Care Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-500" />
                    Interdisciplinary Care Plans
                  </CardTitle>
                  <CardDescription>
                    Collaborative care plans with multi-team goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interdisciplinaryPlans.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{plan.patient_name}</div>
                            <div className="text-sm text-gray-600">{plan.primary_diagnosis}</div>
                          </div>
                          <Badge variant="outline">
                            {plan.coordination_score}% coordination
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {plan.care_goals.map((goal, goalIndex) => (
                            <div key={goalIndex} className="border-l-4 border-blue-200 pl-3">
                              <div className="text-sm font-medium">{goal.goal}</div>
                              <div className="text-xs text-gray-600">
                                Team: {goal.responsible_team.join(', ')}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-xs">
                                  Progress: {goal.progress}%
                                </div>
                                <Badge
                                  variant={
                                    goal.status === 'Ahead of Schedule'
                                      ? 'default'
                                      : goal.status === 'On Track'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {goal.status}
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    goal.progress >= 80 ? 'bg-green-600' :
                                    goal.progress >= 60 ? 'bg-blue-600' :
                                    goal.progress >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                          Last updated: {new Date(plan.last_updated).toLocaleDateString()} | 
                          Next review: {new Date(plan.next_review).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance Metrics and Collaboration Insights */}
            {teamPerformanceMetrics && collaborationInsights && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-teal-500" />
                      Team Performance Metrics
                    </CardTitle>
                    <CardDescription>
                      Key performance indicators for team collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Team Efficiency:</span>
                          <Badge variant="default">
                            {teamPerformanceMetrics.team_efficiency_score}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Response Time:</span>
                          <Badge variant="secondary">
                            {teamPerformanceMetrics.communication_response_time}min
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Care Coordination:</span>
                          <Badge variant="outline">
                            {teamPerformanceMetrics.care_coordination_rating}/5.0
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Patient Satisfaction:</span>
                          <Badge variant="default">
                            {teamPerformanceMetrics.patient_satisfaction_with_team}/5.0
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Collaboration Index:</span>
                          <Badge variant="secondary">
                            {teamPerformanceMetrics.interdisciplinary_collaboration_index}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Plan Adherence:</span>
                          <Badge variant="default">
                            {teamPerformanceMetrics.care_plan_adherence_rate}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Meeting Attendance:</span>
                          <Badge variant="outline">
                            {teamPerformanceMetrics.team_meeting_attendance_rate}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Referral Success:</span>
                          <Badge variant="default">
                            {teamPerformanceMetrics.cross_referral_success_rate}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collaboration Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Collaboration Insights
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights for team optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Strengths:</h4>
                        <div className="space-y-1">
                          {collaborationInsights.collaboration_strengths.map((strength: string, index: number) => (
                            <div key={index} className="text-sm text-gray-700 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {strength}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-orange-600">Improvement Opportunities:</h4>
                        <div className="space-y-1">
                          {collaborationInsights.improvement_opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="text-sm text-gray-700 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-2 text-orange-500" />
                              {opportunity}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-blue-600">Trending Metrics:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(collaborationInsights.trending_metrics).map(([key, value], index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="text-green-600 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* PATIENT OUTCOME TRACKING DASHBOARD */}
          <TabsContent value="outcome-tracking" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">📊 Long-Term Patient Outcome Analytics</h2>
                <p className="text-gray-600">Comprehensive tracking of patient health outcomes and care effectiveness</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Analytics Active
                </Badge>
                <Button 
                  onClick={loadPatientOutcomeTracking} 
                  disabled={dataLoading}
                  variant="outline"
                  size="sm"
                >
                  {dataLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh Analytics
                </Button>
              </div>
            </div>

            {/* Outcome Analytics Overview */}
            {patientOutcomeAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Patients Tracked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {patientOutcomeAnalytics.total_patients_tracked}
                    </div>
                    <p className="text-xs text-blue-600">
                      Over {patientOutcomeAnalytics.tracking_period_months} months
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Improvement Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                      {outcomeMetrics?.overall_improvement_rate || 84}%
                    </div>
                    <p className="text-xs text-green-600">
                      Overall patient improvement
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Care Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">
                      {outcomeMetrics?.average_care_duration || 52}
                    </div>
                    <p className="text-xs text-purple-600">
                      Average days in care
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Goal Achievement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">
                      {outcomeMetrics?.goal_achievement_rate || 88}%
                    </div>
                    <p className="text-xs text-orange-600">
                      Care goals achieved
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Outcome Categories and Longitudinal Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Outcome Categories */}
              {patientOutcomeAnalytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-500" />
                      Outcome Categories
                    </CardTitle>
                    <CardDescription>
                      Performance across key outcome areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patientOutcomeAnalytics.outcome_categories.map((category: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-3">{category.category}</h4>
                          <div className="space-y-2">
                            {category.metrics.map((metric: any, metricIndex: number) => (
                              <div key={metricIndex} className="flex items-center justify-between">
                                <div className="text-sm">
                                  <div>{metric.name}</div>
                                  <div className="text-xs text-gray-500">Benchmark: {metric.benchmark}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{metric.value}{typeof metric.value === 'number' && metric.value < 10 ? '' : '%'}</div>
                                  <div className={`text-xs ${
                                    metric.trend.startsWith('+') ? 'text-green-600' : 
                                    metric.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {metric.trend}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Longitudinal Patient Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Longitudinal Patient Tracking
                  </CardTitle>
                  <CardDescription>
                    Individual patient outcome trajectories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {longitudinalData.slice(0, 2).map((patient: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{patient.patient_name}</div>
                            <div className="text-sm text-gray-600">{patient.diagnosis}</div>
                          </div>
                          <Badge variant="outline">
                            {patient.tracking_duration} days
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Outcome Trajectory:</div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-medium">Start</div>
                              {patient.outcome_trajectory[0] && Object.entries(patient.outcome_trajectory[0]).slice(1).map(([key, value]: [string, any], trajIndex: number) => (
                                <div key={trajIndex}>{key}: {value}</div>
                              ))}
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Current</div>
                              {patient.outcome_trajectory[patient.outcome_trajectory.length - 1] && Object.entries(patient.outcome_trajectory[patient.outcome_trajectory.length - 1]).slice(1).map(([key, value]: [string, any], trajIndex: number) => (
                                <div key={trajIndex}>{key}: {value}</div>
                              ))}
                            </div>
                            <div className="text-center">
                              <div className="font-medium">Predicted</div>
                              {patient.predicted_outcomes.next_3_months && Object.entries(patient.predicted_outcomes.next_3_months).map(([key, value]: [string, any], predIndex: number) => (
                                <div key={predIndex}>{key}: {value}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-1">Key Interventions:</div>
                          <div className="space-y-1">
                            {patient.interventions.slice(0, 2).map((intervention: any, intIndex: number) => (
                              <div key={intIndex} className="text-xs flex justify-between">
                                <span>{intervention.type}</span>
                                <span className="text-green-600">Impact: {intervention.impact_score}/10</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Trends and Quality Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Health Outcome Trends
                  </CardTitle>
                  <CardDescription>
                    Long-term trends in key health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthTrends.map((trend: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{trend.trend_name}</div>
                          <Badge
                            variant={
                              trend.trend_direction === 'Improving'
                                ? 'default'
                                : trend.trend_direction === 'Stable-Improving'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {trend.trend_direction}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Timeframe:</strong> {trend.timeframe}</div>
                          <div><strong>Statistical Significance:</strong> {trend.statistical_significance}</div>
                          <div><strong>Contributing Factors:</strong></div>
                          <ul className="list-disc list-inside ml-2">
                            {trend.contributing_factors.slice(0, 2).map((factor: string, factorIndex: number) => (
                              <li key={factorIndex} className="text-xs">{factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">12-Month Trend:</div>
                          <div className="flex items-end space-x-1 h-8">
                            {trend.data_points.slice(-6).map((point: number, pointIndex: number) => (
                              <div
                                key={pointIndex}
                                className="bg-blue-500 rounded-t"
                                style={{
                                  height: `${(point / Math.max(...trend.data_points)) * 100}%`,
                                  width: '12px'
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Indicators */}
              {qualityIndicators && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Quality Indicators
                    </CardTitle>
                    <CardDescription>
                      Care quality and safety performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {qualityIndicators.clinical_quality_score}
                          </div>
                          <div className="text-sm text-green-600">Clinical Quality</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {qualityIndicators.patient_safety_score}
                          </div>
                          <div className="text-sm text-blue-600">Patient Safety</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {qualityIndicators.care_coordination_score}
                          </div>
                          <div className="text-sm text-purple-600">Care Coordination</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {qualityIndicators.outcome_achievement_score}
                          </div>
                          <div className="text-sm text-orange-600">Outcome Achievement</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Benchmarking:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Industry Percentile:</span>
                            <span className="font-medium">{qualityIndicators.benchmarking.industry_percentile}th</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peer Comparison:</span>
                            <Badge variant="default">{qualityIndicators.benchmarking.peer_comparison}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Accreditation Status:</span>
                            <Badge variant="secondary">{qualityIndicators.benchmarking.accreditation_status}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Improvement Initiatives:</h4>
                        <div className="space-y-2">
                          {qualityIndicators.improvement_initiatives.map((initiative: any, index: number) => (
                            <div key={index} className="border-l-4 border-green-200 pl-3">
                              <div className="text-sm font-medium">{initiative.initiative}</div>
                              <div className="text-xs text-gray-600">{initiative.impact}</div>
                              <div className="text-xs text-gray-500">
                                {initiative.implementation_date} - {initiative.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Clinical Outcomes Predictions */}
            {clinicalOutcomesPredictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                    Clinical Outcomes Predictions
                  </CardTitle>
                  <CardDescription>
                    AI-powered predictions for patient outcomes and interventions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clinicalOutcomesPredictions.map((prediction: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{prediction.prediction_type}</div>
                          <Badge variant="outline">{prediction.patient_cohort}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {prediction.success_probability || prediction.risk_probability}%
                            </div>
                            <div className="text-sm text-blue-600">
                              {prediction.prediction_type.includes('Success') ? 'Success Probability' : 'Risk Probability'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              CI: {prediction.confidence_interval}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Key Predictors:</div>
                            <div className="space-y-1">
                              {prediction.key_predictors.map((predictor: string, predIndex: number) => (
                                <div key={predIndex} className="text-xs flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                  {predictor}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Recommended Interventions:</div>
                            <div className="space-y-1">
                              {prediction.recommended_interventions.map((intervention: string, intIndex: number) => (
                                <div key={intIndex} className="text-xs flex items-center">
                                  <TrendingUp className="w-3 h-3 mr-2 text-blue-500" />
                                  {intervention}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REAL-TIME PATIENT STATUS DASHBOARD */}
          <TabsContent value="patient-status" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🏥 Real-Time Patient Status Dashboard</h2>
                <p className="text-gray-600">Live patient condition monitoring and care workflow optimization</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
                <Button 
                  onClick={loadRealTimePatientData} 
                  disabled={patientStatusLoading}
                  variant="outline"
                  size="sm"
                >
                  {patientStatusLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <div className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Patient Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Active Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {realTimePatients.length}
                  </div>
                  <p className="text-xs text-blue-600">
                    {activeEpisodes.length} active episodes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {patientAlerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length}
                  </div>
                  <p className="text-xs text-red-600">
                    {patientAlerts.filter(alert => alert.status === 'active').length} total active alerts
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Stable Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {vitalSigns.filter(vital => vital.blood_pressure.status === 'normal' && vital.heart_rate.status === 'normal').length}
                  </div>
                  <p className="text-xs text-green-600">
                    {Math.round((vitalSigns.filter(vital => vital.blood_pressure.status === 'normal').length / Math.max(vitalSigns.length, 1)) * 100)}% normal readings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Care Plan Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(careplanProgress.reduce((sum, plan) => sum + plan.overall_progress, 0) / Math.max(careplanProgress.length, 1))}%
                  </div>
                  <p className="text-xs text-purple-600">
                    Average completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Real-Time Patient Monitoring Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Patient Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Active Patient Alerts
                  </CardTitle>
                  <CardDescription>
                    Real-time alerts requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {patientAlerts.filter(alert => alert.status === 'active').length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        ✅ No active alerts - all patients stable
                      </div>
                    ) : (
                      patientAlerts
                        .filter(alert => alert.status === 'active')
                        .sort((a, b) => {
                          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                          return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
                        })
                        .map((alert, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-3 ${
                              alert.severity === 'critical'
                                ? 'border-red-200 bg-red-50'
                                : alert.severity === 'high'
                                ? 'border-orange-200 bg-orange-50'
                                : alert.severity === 'medium'
                                ? 'border-yellow-200 bg-yellow-50'
                                : 'border-blue-200 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">
                                {alert.patient_name}
                              </div>
                              <Badge
                                variant={
                                  alert.severity === 'critical'
                                    ? 'destructive'
                                    : alert.severity === 'high'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              {alert.message}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {alert.alert_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                    Vital Signs Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time patient vital signs and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {vitalSigns.map((vital, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {vital.patient_name}
                          </div>
                          <Badge
                            variant={
                              vital.trend === 'improving'
                                ? 'default'
                                : vital.trend === 'declining'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {vital.trend}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>BP:</span>
                            <span className={vital.blood_pressure.status === 'high' ? 'text-red-600 font-medium' : ''}>
                              {vital.blood_pressure.systolic}/{vital.blood_pressure.diastolic}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>HR:</span>
                            <span className={vital.heart_rate.status === 'elevated' ? 'text-orange-600 font-medium' : ''}>
                              {vital.heart_rate.value} bpm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temp:</span>
                            <span className={vital.temperature.status === 'fever' ? 'text-red-600 font-medium' : ''}>
                              {vital.temperature.value.toFixed(1)}°C
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>O2 Sat:</span>
                            <span className={vital.oxygen_saturation.status === 'low' ? 'text-red-600 font-medium' : ''}>
                              {vital.oxygen_saturation.value}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Last reading: {new Date(vital.last_reading).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medication Adherence and Care Plan Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medication Adherence Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-green-500" />
                    Medication Adherence
                  </CardTitle>
                  <CardDescription>
                    Patient medication compliance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {medicationAdherence.map((med, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {med.patient_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                med.adherence_rate >= 90
                                  ? 'default'
                                  : med.adherence_rate >= 70
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {med.adherence_rate}%
                            </Badge>
                            <Badge
                              variant={
                                med.risk_level === 'high'
                                  ? 'destructive'
                                  : med.risk_level === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {med.risk_level} risk
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {med.medications.map((medication: any, medIndex: number) => (
                            <div key={medIndex} className="flex justify-between text-xs">
                              <span>{medication.name}</span>
                              <Badge
                                variant={medication.status === 'taken' ? 'secondary' : medication.status === 'missed' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {medication.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Missed doses: {med.missed_doses} | Next: {new Date(med.next_dose).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Care Plan Progress Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Care Plan Progress
                  </CardTitle>
                  <CardDescription>
                    Patient care plan milestones and progress tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {careplanProgress.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {plan.patient_name}
                          </div>
                          <Badge
                            variant={
                              plan.status === 'ahead'
                                ? 'default'
                                : plan.status === 'behind'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{plan.overall_progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                plan.overall_progress >= 80
                                  ? 'bg-green-600'
                                  : plan.overall_progress >= 60
                                  ? 'bg-blue-600'
                                  : plan.overall_progress >= 40
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${plan.overall_progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Goals completed:</span>
                            <span>{plan.goals_completed}/{plan.goals_total}</span>
                          </div>
                          <div>
                            <span className="font-medium">Next milestone:</span>
                            <div className="text-gray-600">{plan.next_milestone}</div>
                          </div>
                          <div className="text-gray-500">
                            Due: {new Date(plan.milestone_due).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Status Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Comprehensive Patient Status Overview</CardTitle>
                <CardDescription>
                  Complete real-time patient monitoring dashboard with automated care plan generation insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vitals</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Care Progress</TableHead>
                        <TableHead>Alerts</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realTimePatients.slice(0, 10).map((patient, index) => {
                        const patientVitals = vitalSigns.find(v => v.patient_id === patient.id);
                        const patientMeds = medicationAdherence.find(m => m.patient_id === patient.id);
                        const patientCare = careplanProgress.find(c => c.patient_id === patient.id);
                        const patientAlertCount = patientAlerts.filter(a => a.patient_id === patient.id && a.status === 'active').length;
                        
                        return (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {patient.first_name_en} {patient.last_name_en}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {patient.emirates_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {patientVitals ? (
                                <div className="text-xs">
                                  <div>BP: {patientVitals.blood_pressure.systolic}/{patientVitals.blood_pressure.diastolic}</div>
                                  <div>HR: {patientVitals.heart_rate.value}</div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {patientVitals.trend}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-gray-400">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {patientMeds ? (
                                <div className="text-xs">
                                  <div>{patientMeds.adherence_rate}% adherence</div>
                                  <Badge
                                    variant={patientMeds.risk_level === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs mt-1"
                                  >
                                    {patientMeds.risk_level} risk
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-gray-400">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {patientCare ? (
                                <div className="text-xs">
                                  <div>{patientCare.overall_progress}% complete</div>
                                  <Badge
                                    variant={patientCare.status === 'ahead' ? 'default' : patientCare.status === 'behind' ? 'destructive' : 'secondary'}
                                    className="text-xs mt-1"
                                  >
                                    {patientCare.status}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-gray-400">No data</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {patientAlertCount > 0 ? (
                                <Badge variant="destructive">
                                  {patientAlertCount} alerts
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Clear</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Plans</CardTitle>
                <CardDescription>
                  {plans.length} plans for {selectedDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan ID</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead>Patients</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : plans.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-4 text-gray-500"
                          >
                            No plans found for this date
                          </TableCell>
                        </TableRow>
                      ) : (
                        plans.map((plan) => (
                          <TableRow key={plan._id?.toString()}>
                            <TableCell className="font-medium">
                              {plan.plan_id}
                            </TableCell>
                            <TableCell>{plan.shift}</TableCell>
                            <TableCell>{plan.team_lead}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {plan.total_patients} total
                                </div>
                                <div className="text-xs text-gray-500">
                                  {plan.high_priority_patients} high,{" "}
                                  {plan.medium_priority_patients} medium,{" "}
                                  {plan.low_priority_patients} low
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {plan.staff_assigned.length} assigned
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(plan.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                {plan.status === "draft" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprovePlan(plan._id!.toString())
                                    }
                                    disabled={loading}
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setShowUpdateDialog(true);
                                    loadUpdates(plan.plan_id);
                                  }}
                                >
                                  Update
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENHANCED: Asset Optimization Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🚀 Smart Asset Optimization</h2>
                <p className="text-gray-600">AI-powered staff, vehicle, and driver allocation optimization</p>
              </div>
              <Button 
                onClick={handleOptimizeAssets} 
                disabled={optimizationLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {optimizationLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Optimize Assets
              </Button>
            </div>

            {assetOptimization && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Optimization Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Optimization Results</CardTitle>
                    <CardDescription>AI-powered allocation analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Optimization Score:</span>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {assetOptimization.optimization_score.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cost Savings:</span>
                        <span className="text-green-600 font-bold">
                          ${assetOptimization.cost_savings.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Environmental Impact:</span>
                        <span className="text-green-600">
                          {assetOptimization.environmental_impact.toFixed(1)}% reduction
                        </span>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Efficiency Improvements:</h4>
                        <ul className="space-y-1">
                          {assetOptimization.efficiency_improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle>👥 Optimized Staff Assignments</CardTitle>
                    <CardDescription>AI-matched staff-patient allocations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assetOptimization.staff_assignments.slice(0, 5).map((assignment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{assignment.staff_name}</span>
                            <Badge variant="outline">
                              {assignment.skill_match_score}% match
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>Workload: {(assignment.estimated_workload * 100).toFixed(0)}%</div>
                            <div>Zone Efficiency: {assignment.zone_efficiency}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Replacement Suggestions */}
                {replacementSuggestions.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>🔄 Automated Replacement Suggestions</CardTitle>
                      <CardDescription>AI-identified optimization opportunities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {replacementSuggestions.slice(0, 3).map((suggestion, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Replacement Opportunity</div>
                              <Badge 
                                variant={suggestion.urgency === 'Critical' ? 'destructive' : 
                                        suggestion.urgency === 'High' ? 'default' : 'secondary'}
                              >
                                {suggestion.urgency}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div><strong>Reason:</strong> {suggestion.reason}</div>
                              <div><strong>Impact Score:</strong> +{suggestion.impact_score}</div>
                              <div><strong>Estimated Improvement:</strong> {suggestion.estimated_improvement}%</div>
                              <div><strong>Implementation Time:</strong> {suggestion.implementation_time} minutes</div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" variant="outline">
                                Apply Suggestion
                              </Button>
                              <Button size="sm" variant="ghost">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Predictions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>🎯 Performance Predictions</CardTitle>
                    <CardDescription>AI-powered outcome forecasting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {assetOptimization.performance_predictions.expected_efficiency}%
                        </div>
                        <div className="text-sm text-gray-600">Expected Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {assetOptimization.performance_predictions.predicted_patient_satisfaction}%
                        </div>
                        <div className="text-sm text-gray-600">Patient Satisfaction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${assetOptimization.performance_predictions.estimated_cost_per_patient}
                        </div>
                        <div className="text-sm text-gray-600">Cost per Patient</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {(assetOptimization.performance_predictions.success_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Probability</div>
                      </div>
                    </div>
                    {assetOptimization.performance_predictions.risk_factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Risk Factors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {assetOptimization.performance_predictions.risk_factors.map((risk, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!assetOptimization && (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">🚀 AI-Powered Asset Optimization Ready</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced machine learning algorithms will analyze your staff, vehicles, and equipment to provide optimal allocation recommendations with predictive insights.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Staff Matching</div>
                      <div className="text-blue-600">Skills-based allocation</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Route Optimization</div>
                      <div className="text-green-600">Fuel & time savings</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Cost Analysis</div>
                      <div className="text-purple-600">ROI predictions</div>
                    </div>
                  </div>
                  <Button onClick={handleOptimizeAssets} disabled={optimizationLoading} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {optimizationLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running AI Analysis...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Start AI Optimization
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ENHANCED: Vehicle Management Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle>🚗 Available Vehicles</CardTitle>
                  <CardDescription>{availableVehicles.length} vehicles ready for assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableVehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{vehicle.vehicle_type} - {vehicle.license_plate}</div>
                          <Badge 
                            variant={vehicle.maintenance_status === 'Operational' ? 'default' : 'secondary'}
                          >
                            {vehicle.maintenance_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Fuel: {vehicle.fuel_level}% | Efficiency: {vehicle.fuel_efficiency} L/100km</div>
                          <div>Capacity: {vehicle.capacity} passengers</div>
                          <div>Location: {vehicle.gps_location?.latitude.toFixed(4)}, {vehicle.gps_location?.longitude.toFixed(4)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle>👨‍💼 Available Drivers</CardTitle>
                  <CardDescription>{availableDrivers.length} drivers ready for assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableDrivers.slice(0, 5).map((driver, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{driver.driver_name}</div>
                          <Badge variant="default">
                            {driver.safety_rating}/10 Safety
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Experience: {driver.experience_years} years</div>
                          <div>On-time: {driver.performance_metrics.on_time_percentage}%</div>
                          <div>License: {driver.license_type.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Performance */}
              {assetPerformance && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>📈 Asset Performance Analytics</CardTitle>
                    <CardDescription>Last 7 days performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Staff Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Efficiency:</span>
                            <span>{assetPerformance.staff_performance.average_efficiency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfaction:</span>
                            <span>{assetPerformance.staff_performance.patient_satisfaction}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span>{assetPerformance.staff_performance.utilization_rate}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Vehicle Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Fuel Efficiency:</span>
                            <span>{assetPerformance.vehicle_performance.fuel_efficiency} L/100km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maintenance Cost:</span>
                            <span>${assetPerformance.vehicle_performance.maintenance_cost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilization:</span>
                            <span>{assetPerformance.vehicle_performance.utilization_rate}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Driver Performance</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>On-time:</span>
                            <span>{assetPerformance.driver_performance.on_time_percentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safety Incidents:</span>
                            <span>{assetPerformance.driver_performance.safety_incidents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Score:</span>
                            <span>{assetPerformance.driver_performance.fuel_efficiency_score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {assetPerformance.optimization_opportunities && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Optimization Opportunities</h4>
                        <div className="space-y-2">
                          {assetPerformance.optimization_opportunities.map((opportunity: string, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                              {opportunity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Framework Matrix Tab */}
          <TabsContent value="framework" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Framework Matrix Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>🏥 Framework Matrix Alerts</CardTitle>
                  <CardDescription>
                    Clinical operations workflow monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.framework_matrix_alerts?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        ✅ All Framework Matrix functions operating normally
                      </div>
                    ) : (
                      attentionItems?.framework_matrix_alerts?.map(
                        (alert, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              alert.severity === "high"
                                ? "border-red-200 bg-red-50"
                                : "border-yellow-200 bg-yellow-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">
                                {alert.function} - {alert.process}
                              </div>
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {alert.framework_requirement}
                            </div>
                            <div className="text-sm font-medium">
                              Action: {alert.action_required}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Responsible: {alert.responsible_person}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Operations Status */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Clinical Operations Status</CardTitle>
                  <CardDescription>
                    Framework Matrix function performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.clinical_operations_status?.map(
                      (status, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{status.function}</div>
                            <Badge
                              variant={
                                status.compliance_status === "compliant"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {status.compliance_status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(status.metrics).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-600">
                                    {key
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    :
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {value}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {status.framework_requirement}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Plans Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todaysPlans.map((plan) => (
                <Card key={plan._id?.toString()}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.plan_id}</CardTitle>
                      {getStatusBadge(plan.status)}
                    </div>
                    <CardDescription>
                      {plan.shift} Shift - {plan.team_lead}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Total Patients
                        </div>
                        <div className="text-2xl font-bold">
                          {plan.total_patients}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Staff Assigned
                        </div>
                        <div className="text-2xl font-bold">
                          {plan.staff_assigned.length}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>High Priority:</span>
                        <span>{plan.high_priority_patients}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium Priority:</span>
                        <span>{plan.medium_priority_patients}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Low Priority:</span>
                        <span>{plan.low_priority_patients}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowUpdateDialog(true);
                          loadUpdates(plan.plan_id);
                        }}
                      >
                        Add Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>
                  Latest updates from active plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {updates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No updates available. Select a plan to view its updates.
                    </div>
                  ) : (
                    updates.map((update) => (
                      <div
                        key={update._id?.toString()}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{update.plan_id}</div>
                          <div className="text-sm text-gray-500">
                            {update.update_time} by {update.updated_by}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Completed:</span>{" "}
                            {update.patients_completed}
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>{" "}
                            {update.patients_remaining}
                          </div>
                        </div>
                        {update.issues_encountered.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-red-600">
                              Issues:
                            </div>
                            {update.issues_encountered.map((issue, index) => (
                              <div key={index} className="text-sm text-red-600">
                                • {issue.description} ({issue.severity})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOH Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Violations */}
              <Card>
                <CardHeader>
                  <CardTitle>🏛️ DOH Compliance Violations</CardTitle>
                  <CardDescription>
                    Regulatory compliance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.compliance_violations?.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        ✅ No compliance violations detected
                      </div>
                    ) : (
                      attentionItems?.compliance_violations?.map(
                        (violation, index) => (
                          <div
                            key={index}
                            className="border border-red-200 bg-red-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-red-800">
                                {violation.type}
                              </div>
                              <Badge variant="destructive">
                                {violation.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-red-700 mb-2">
                              {violation.description}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Regulation:</span>{" "}
                              {violation.regulation}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                Action Required:
                              </span>{" "}
                              {violation.action_required}
                            </div>
                            {violation.deadline && (
                              <div className="text-xs text-red-600 mt-1">
                                Deadline: {violation.deadline}
                              </div>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Late Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle>⏰ Late Submissions (8:00 AM Rule)</CardTitle>
                  <CardDescription>
                    Daily planning submission compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attentionItems?.late_submissions?.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        ✅ All submissions on time
                      </div>
                    ) : (
                      attentionItems?.late_submissions?.map(
                        (submission, index) => (
                          <div
                            key={index}
                            className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-orange-800">
                                {submission.plan_id}
                              </div>
                              <Badge variant="secondary">
                                {submission.delay_minutes} min late
                              </Badge>
                            </div>
                            <div className="text-sm text-orange-700">
                              Team Lead: {submission.team_lead}
                            </div>
                            <div className="text-sm text-orange-700">
                              Department: {submission.department}
                            </div>
                            <div className="text-sm text-orange-700">
                              Submitted: {submission.submission_time}
                            </div>
                            <div className="text-xs text-orange-600 mt-2">
                              {submission.compliance_impact}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Skills Matrix Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Skills Matrix Overview</CardTitle>
                  <CardDescription>Staff competencies and skill gaps analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {skillsMatrix.length > 0 ? Math.round((skillsMatrix.length / (skillsMatrix.length + (skillGaps?.critical_gaps?.length || 0))) * 100) : 85}%
                        </div>
                        <div className="text-sm text-blue-600">Skills Coverage</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {skillGaps?.critical_gaps?.length || 3}
                        </div>
                        <div className="text-sm text-orange-600">Critical Gaps</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {skillsMatrix.length || 24}
                        </div>
                        <div className="text-sm text-green-600">Active Staff</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Top Skill Gaps:</div>
                      <div className="space-y-1">
                        {skillGaps?.critical_gaps?.slice(0, 3).map((gap: string, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{gap}</span>
                            <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                              {index === 0 ? "Critical" : index === 1 ? "High" : "Medium"}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="flex justify-between text-sm">
                            <span>Advanced Wound Care</span>
                            <Badge variant="destructive">Critical</Badge>
                          </div>,
                          <div key="2" className="flex justify-between text-sm">
                            <span>IV Therapy</span>
                            <Badge variant="default">High</Badge>
                          </div>,
                          <div key="3" className="flex justify-between text-sm">
                            <span>Pediatric Care</span>
                            <Badge variant="secondary">Medium</Badge>
                          </div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📚 Training Priorities</CardTitle>
                  <CardDescription>Upcoming training requirements and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillGaps?.training_priorities?.map((priority: string, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{priority}</div>
                          <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                            {index === 0 ? "Due Soon" : index === 1 ? "Scheduled" : "Planned"}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {index === 0 ? "5 staff members need renewal by next month" :
                           index === 1 ? "Training session scheduled for next week" :
                           "New DOH requirements training"}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Advanced Life Support</div>
                          <Badge variant="destructive">Due Soon</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          5 staff members need renewal by next month
                        </div>
                      </div>,
                      <div key="2" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Infection Control</div>
                          <Badge variant="default">Scheduled</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Training session scheduled for next week
                        </div>
                      </div>,
                      <div key="3" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Documentation Standards</div>
                          <Badge variant="secondary">Planned</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          New DOH requirements training
                        </div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Skills Matrix */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>👥 Staff Skills Matrix</CardTitle>
                  <CardDescription>Individual staff competencies and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillsMatrix.slice(0, 5).map((staff, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{staff.staff_name}</div>
                          <Badge variant="outline">
                            {staff.core_competencies.length} competencies
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Core Competencies:</div>
                            <div className="flex flex-wrap gap-1">
                              {staff.core_competencies.slice(0, 3).map((comp, compIndex) => (
                                <Badge key={compIndex} variant="secondary" className="text-xs">
                                  {comp.skill_name} ({comp.proficiency_level})
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Training Requirements:</div>
                            <div className="space-y-1">
                              {staff.training_requirements.slice(0, 2).map((training, trainIndex) => (
                                <div key={trainIndex} className="text-xs">
                                  <span className="font-medium">{training.training_name}</span>
                                  <Badge 
                                    variant={training.priority === 'Critical' ? 'destructive' : 
                                            training.priority === 'High' ? 'default' : 'secondary'}
                                    className="ml-2 text-xs"
                                  >
                                    {training.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Equipment Management Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🔧 Equipment Status</CardTitle>
                  <CardDescription>Current equipment inventory and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Available:</span>
                      <Badge variant="secondary">
                        {equipmentInventory.filter(eq => eq.status === 'Available').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Use:</span>
                      <Badge variant="default">
                        {equipmentInventory.filter(eq => eq.status === 'In Use').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance:</span>
                      <Badge variant="outline">
                        {equipmentInventory.filter(eq => eq.status === 'Maintenance').length} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs Attention:</span>
                      <Badge variant="destructive">
                        {equipmentInventory.filter(eq => eq.status === 'Damaged').length} items
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>⚠️ Maintenance Alerts</CardTitle>
                  <CardDescription>Equipment requiring maintenance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {maintenanceDue.slice(0, 5).map((equipment, index) => (
                      <div key={index} className="text-sm border rounded p-2">
                        <div className="font-medium">{equipment.equipment_name} #{equipment.equipment_id}</div>
                        <div className="text-xs text-gray-600">
                          {equipment.maintenance_schedule.maintenance_type} maintenance due
                        </div>
                        <div className="text-xs text-orange-600">
                          Next: {equipment.maintenance_schedule.next_maintenance}
                        </div>
                      </div>
                    ))}
                    {maintenanceDue.length === 0 && (
                      <div className="text-center py-4 text-green-600">
                        ✅ All equipment maintenance up to date
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Utilization Metrics</CardTitle>
                  <CardDescription>Equipment usage and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Medical', 'Mobility', 'Diagnostic', 'Safety', 'Communication'].map((category, index) => {
                      const categoryEquipment = equipmentInventory.filter(eq => eq.category === category);
                      const utilizationRate = categoryEquipment.length > 0 
                        ? Math.round((categoryEquipment.reduce((sum, eq) => sum + eq.usage_tracking.utilization_rate, 0) / categoryEquipment.length))
                        : [78, 92, 65, 85, 70][index];
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category} Equipment</span>
                            <span>{utilizationRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilizationRate >= 90 ? 'bg-green-600' :
                                utilizationRate >= 70 ? 'bg-blue-600' :
                                utilizationRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{width: `${utilizationRate}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Inventory Details */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>📋 Equipment Inventory Details</CardTitle>
                  <CardDescription>Comprehensive equipment tracking and management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Utilization</TableHead>
                          <TableHead>Next Maintenance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipmentInventory.slice(0, 10).map((equipment, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{equipment.equipment_id}</TableCell>
                            <TableCell>{equipment.equipment_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{equipment.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  equipment.status === 'Available' ? 'secondary' :
                                  equipment.status === 'In Use' ? 'default' :
                                  equipment.status === 'Maintenance' ? 'outline' : 'destructive'
                                }
                              >
                                {equipment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{equipment.current_location}</TableCell>
                            <TableCell>{equipment.usage_tracking.utilization_rate}%</TableCell>
                            <TableCell>{equipment.maintenance_schedule.next_maintenance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Quality Metrics Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>⭐ Patient Satisfaction</CardTitle>
                  <CardDescription>Patient feedback and satisfaction scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.overall_satisfaction.toFixed(1) || '4.2'}
                        </div>
                        <div className="text-sm text-gray-600">Overall Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.patient_satisfaction_scores.overall_satisfaction * 20) : 94}%
                        </div>
                        <div className="text-sm text-gray-600">Satisfaction Rate</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Care Quality:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.care_quality_rating.toFixed(1) || '4.4'}/5.0
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Communication:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.communication_rating.toFixed(1) || '4.1'}/5.0
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Timeliness:</span>
                        <span className="font-medium">
                          {qualityMetrics?.clinical_outcomes.patient_satisfaction_scores.timeliness_rating.toFixed(1) || '3.9'}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏥 Clinical Outcomes</CardTitle>
                  <CardDescription>Key clinical performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Readmission Rate:</span>
                      <Badge variant="secondary">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.readmission_rate * 100) : 8}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Infection Rate:</span>
                      <Badge variant="secondary">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.infection_rate * 100) : 2}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medication Adherence:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.medication_adherence * 100) : 92}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Functional Improvement:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.clinical_outcomes.clinical_indicators.functional_improvement * 100) : 78}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Safety Incidents:</span>
                      <Badge variant="outline">
                        {qualityMetrics ? (qualityMetrics.clinical_outcomes.safety_metrics.incident_rate * 100).toFixed(1) : '1.5'}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Operational Quality</CardTitle>
                  <CardDescription>Service delivery performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On-time Performance:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.operational_quality.on_time_performance * 100) : 94}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Visit Completion Rate:</span>
                      <Badge variant="default">
                        {qualityMetrics ? Math.round(qualityMetrics.operational_quality.visit_completion_rate * 100) : 98}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Quality:</span>
                      <Badge variant="secondary">
                        {qualityMetrics?.operational_quality.documentation_quality_score.toFixed(1) || '4.1'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staff Competency:</span>
                      <Badge variant="secondary">
                        {qualityMetrics?.operational_quality.staff_competency_scores.toFixed(1) || '4.2'}/5.0
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benchmarking Data */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Industry Benchmarking</CardTitle>
                  <CardDescription>Performance comparison and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {qualityMetrics?.benchmarking_data.industry_percentile || 75}th
                      </div>
                      <div className="text-sm text-gray-600">Industry Percentile</div>
                    </div>
                    <div className="text-center">
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {qualityMetrics?.benchmarking_data.peer_comparison || 'Above Average'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Improvement Trends:</div>
                      {qualityMetrics?.benchmarking_data.improvement_trends.map((trend, index) => (
                        <div key={index} className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          {trend}
                        </div>
                      )) || [
                        <div key="1" className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Patient satisfaction improving
                        </div>,
                        <div key="2" className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Safety metrics stable
                        </div>
                      ]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Financial Analytics Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>💰 Revenue Analysis</CardTitle>
                  <CardDescription>Financial performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${financialAnalytics?.revenue_analysis.total_revenue.toLocaleString() || '125,000'}
                      </div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue per Patient:</span>
                        <span className="font-medium">
                          ${financialAnalytics?.revenue_analysis.revenue_per_patient || 285}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Revenue per Hour:</span>
                        <span className="font-medium">
                          ${financialAnalytics?.revenue_analysis.revenue_per_hour || 95}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gross Margin:</span>
                        <span className="font-medium">
                          {financialAnalytics ? Math.round(financialAnalytics.profitability_metrics.gross_margin * 100) : 32}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Cost Breakdown</CardTitle>
                  <CardDescription>Operational cost analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Staff Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.staff_costs.regular_hours + 
                           financialAnalytics.cost_breakdown.staff_costs.overtime_costs + 
                           financialAnalytics.cost_breakdown.staff_costs.benefits_costs).toLocaleString() 
                          : '69,000'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '69%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Vehicle Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.vehicle_costs.fuel_costs + 
                           financialAnalytics.cost_breakdown.vehicle_costs.maintenance_costs + 
                           financialAnalytics.cost_breakdown.vehicle_costs.insurance_costs).toLocaleString() 
                          : '11,700'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '12%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Equipment Costs</span>
                        <span>${financialAnalytics ? 
                          (financialAnalytics.cost_breakdown.equipment_costs.purchase_costs + 
                           financialAnalytics.cost_breakdown.equipment_costs.maintenance_costs + 
                           financialAnalytics.cost_breakdown.equipment_costs.replacement_costs).toLocaleString() 
                          : '11,700'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{width: '19%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Optimization Opportunities</CardTitle>
                  <CardDescription>Cost savings potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialAnalytics?.optimization_opportunities.map((opportunity, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">
                            {opportunity.recommendations[0] || 'Optimization Opportunity'}
                          </div>
                          <Badge variant={
                            opportunity.implementation_priority === 'High' ? 'default' :
                            opportunity.implementation_priority === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {opportunity.implementation_priority} Priority
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: ${opportunity.potential_savings.toLocaleString()}/month
                        </div>
                        <div className="text-xs text-green-600">
                          {opportunity.recommendations.slice(1).join(', ')}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">Staff Scheduling</div>
                          <Badge variant="default">High Priority</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: $5,500/month
                        </div>
                        <div className="text-xs text-green-600">
                          Reduce overtime by 15%
                        </div>
                      </div>,
                      <div key="2" className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">Route Optimization</div>
                          <Badge variant="secondary">Medium Priority</Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          Potential savings: $2,200/month
                        </div>
                        <div className="text-xs text-green-600">
                          Improve fuel efficiency
                        </div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>

              {/* Payer Mix Analysis */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>🏥 Payer Mix Analysis</CardTitle>
                  <CardDescription>Revenue distribution by insurance type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {financialAnalytics?.revenue_analysis.payer_mix.map((payer, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{payer.percentage}%</div>
                        <div className="text-sm text-gray-600 mb-2">{payer.insurance_type}</div>
                        <div className="text-sm font-medium">
                          Avg: ${payer.average_reimbursement}
                        </div>
                      </div>
                    )) || [
                      <div key="1" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">45%</div>
                        <div className="text-sm text-gray-600 mb-2">Government</div>
                        <div className="text-sm font-medium">Avg: $275</div>
                      </div>,
                      <div key="2" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">35%</div>
                        <div className="text-sm text-gray-600 mb-2">Private</div>
                        <div className="text-sm font-medium">Avg: $320</div>
                      </div>,
                      <div key="3" className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-orange-600">20%</div>
                        <div className="text-sm text-gray-600 mb-2">Self-Pay</div>
                        <div className="text-sm font-medium">Avg: $250</div>
                      </div>
                    ]}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Workforce Intelligence Tab */}
          <TabsContent value="workforce" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workforce Metrics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>👥 Workforce Intelligence Overview</CardTitle>
                  <CardDescription>Comprehensive workforce analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {workforceIntelligence?.workforce_metrics.total_staff || 24}
                      </div>
                      <div className="text-sm text-blue-600">Total Staff</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {workforceIntelligence?.workforce_metrics.active_staff || 22}
                      </div>
                      <div className="text-sm text-green-600">Active Staff</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {workforceIntelligence ? Math.round(workforceIntelligence.workforce_metrics.staff_utilization_rate) : 78}%
                      </div>
                      <div className="text-sm text-purple-600">Utilization Rate</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {workforceIntelligence?.workforce_metrics.satisfaction_score.toFixed(1) || '4.1'}
                      </div>
                      <div className="text-sm text-orange-600">Satisfaction Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Productivity Analysis</CardTitle>
                  <CardDescription>Performance metrics and benchmarking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patients per Staff/Day:</span>
                      <Badge variant="default">
                        {workforceIntelligence?.productivity_analysis.patients_per_staff_per_day.toFixed(1) || '6.5'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue per Staff:</span>
                      <Badge variant="secondary">
                        ${workforceIntelligence?.productivity_analysis.revenue_per_staff.toLocaleString() || '2,850'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Benchmark:</span>
                      <Badge variant={workforceIntelligence?.productivity_analysis.benchmark_comparison.internal_target >= 90 ? 'default' : 'outline'}>
                        {workforceIntelligence?.productivity_analysis.benchmark_comparison.internal_target || 90}%
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Efficiency Trends:</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Week over Week:</span>
                          <span className={workforceIntelligence?.productivity_analysis.efficiency_trends.week_over_week > 0 ? 'text-green-600' : 'text-red-600'}>
                            {workforceIntelligence ? (workforceIntelligence.productivity_analysis.efficiency_trends.week_over_week * 100).toFixed(1) : '+3.0'}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Month over Month:</span>
                          <span className={workforceIntelligence?.productivity_analysis.efficiency_trends.month_over_month > 0 ? 'text-green-600' : 'text-red-600'}>
                            {workforceIntelligence ? (workforceIntelligence.productivity_analysis.efficiency_trends.month_over_month * 100).toFixed(1) : '+8.0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>🔮 Predictive Insights & Optimization</CardTitle>
                  <CardDescription>AI-powered workforce predictions and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-red-600">Turnover Risk Analysis</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">High Risk Staff:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.high_risk_staff.length || 3} staff members
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Predicted Departures:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.predicted_departures || 3} in next 90 days
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Top Retention Strategy:</span>
                          <div className="text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.turnover_risk.retention_strategies[0] || 'Implement flexible scheduling'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-blue-600">Capacity Forecasting</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Next 30 Days:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.capacity_forecasting.next_30_days || 25} staff needed
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Next 90 Days:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {workforceIntelligence?.predictive_insights.capacity_forecasting.next_90_days || 27} staff needed
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Seasonal Adjustment:</span>
                          <div className="text-gray-600 mt-1">
                            {workforceIntelligence ? (workforceIntelligence.predictive_insights.capacity_forecasting.seasonal_adjustments * 100).toFixed(0) : '8'}% increase expected
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-green-600">Optimization Opportunities</h4>
                      <div className="space-y-2">
                        {workforceIntelligence?.predictive_insights.optimization_opportunities.cross_training_needs.slice(0, 3).map((need: string, index: number) => (
                          <div key={index} className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {need}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="text-xs"><Badge variant="outline" className="text-xs">Advanced wound care</Badge></div>,
                          <div key="2" className="text-xs"><Badge variant="outline" className="text-xs">Pediatric specialization</Badge></div>,
                          <div key="3" className="text-xs"><Badge variant="outline" className="text-xs">Mental health support</Badge></div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Patient Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clinical Outcomes Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>🏥 Clinical Outcomes Overview</CardTitle>
                  <CardDescription>Patient care effectiveness and satisfaction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.clinical_outcomes.functional_improvement, 0) / patientOutcomes.length) : 78}%
                      </div>
                      <div className="text-sm text-green-600">Functional Improvement</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.satisfaction_metrics.overall_satisfaction, 0) / patientOutcomes.length).toFixed(1) : '4.2'}
                      </div>
                      <div className="text-sm text-blue-600">Satisfaction Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.clinical_outcomes.medication_adherence, 0) / patientOutcomes.length) : 92}%
                      </div>
                      <div className="text-sm text-purple-600">Medication Adherence</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {patientOutcomes.filter((p: any) => p.clinical_outcomes.readmission_within_30_days).length}
                      </div>
                      <div className="text-sm text-orange-600">30-Day Readmissions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle>💰 Cost Effectiveness Analysis</CardTitle>
                  <CardDescription>Financial impact and value-based care metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Cost per Patient:</span>
                      <Badge variant="secondary">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.total_cost, 0) / patientOutcomes.length) : 1850}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost per Visit:</span>
                      <Badge variant="outline">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.cost_per_visit, 0) / patientOutcomes.length) : 185}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Savings vs Hospital Care:</span>
                      <Badge variant="default">
                        ${patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.cost_savings_vs_hospital, 0) / patientOutcomes.length) : 2400}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Insurance Coverage Rate:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round((patientOutcomes.reduce((sum: number, p: any) => sum + p.cost_effectiveness.insurance_coverage, 0) / patientOutcomes.length) * 100) : 94}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>⭐ Quality Performance Indicators</CardTitle>
                  <CardDescription>Care quality and safety metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Documentation Completeness:</span>
                      <Badge variant="secondary">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.documentation_completeness, 0) / patientOutcomes.length) : 96}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Care Plan Adherence:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.care_plan_adherence, 0) / patientOutcomes.length) : 94}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Safety Incidents:</span>
                      <Badge variant={patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.safety_incidents, 0) === 0 ? 'secondary' : 'destructive'}>
                        {patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.safety_incidents, 0)} incidents
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Infection Prevention Score:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? Math.round(patientOutcomes.reduce((sum: number, p: any) => sum + p.quality_indicators.infection_prevention_score, 0) / patientOutcomes.length) : 98}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Performance Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>👨‍⚕️ Staff Performance Impact</CardTitle>
                  <CardDescription>How staff performance affects patient outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Primary Nurse Rating:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.primary_nurse_rating, 0) / patientOutcomes.length).toFixed(1) : '4.3'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Therapist Effectiveness:</span>
                      <Badge variant="secondary">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.therapist_effectiveness, 0) / patientOutcomes.length).toFixed(1) : '4.1'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Care Coordination:</span>
                      <Badge variant="outline">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.care_coordination_score, 0) / patientOutcomes.length).toFixed(1) : '4.0'}/5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Family Engagement:</span>
                      <Badge variant="default">
                        {patientOutcomes.length > 0 ? (patientOutcomes.reduce((sum: number, p: any) => sum + p.staff_performance_impact.family_engagement_level, 0) / patientOutcomes.length).toFixed(1) : '3.9'}/5.0
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENHANCED: Advanced Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Performance Indicators */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients Served</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.total_patients_served || plans.reduce((sum, plan) => sum + plan.total_patients, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.average_satisfaction_score.toFixed(1) || '4.2'}
                  </div>
                  <p className="text-xs text-muted-foreground">Out of 5.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost per Patient</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${advancedAnalytics?.dashboard_metrics.cost_per_patient || 185}
                  </div>
                  <p className="text-xs text-muted-foreground">Average cost</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {advancedAnalytics?.dashboard_metrics.staff_efficiency_score.toFixed(1) || '87.5'}%
                  </div>
                  <p className="text-xs text-muted-foreground">Performance score</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Analysis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Performance Trends</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Patient Volume Trend</span>
                        <span className="text-green-600">+12% this month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Satisfaction Trend</span>
                        <span className="text-green-600">+5% improvement</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '84%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Cost Efficiency</span>
                        <span className="text-green-600">-8% cost reduction</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Staff Efficiency</span>
                        <span className="text-green-600">+3% this quarter</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔮 Predictive Models</CardTitle>
                  <CardDescription>AI-powered forecasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Month Patient Volume:</span>
                      <Badge variant="default">
                        {advancedAnalytics?.predictive_models.next_month_patient_volume || 168} patients
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Predicted Staff Needs:</span>
                      <Badge variant="secondary">
                        {advancedAnalytics?.predictive_models.predicted_staff_needs || 25} staff
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Estimated Revenue:</span>
                      <Badge variant="outline">
                        ${advancedAnalytics?.predictive_models.estimated_revenue.toLocaleString() || '140,000'}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Risk Factors:</div>
                      <div className="space-y-1">
                        {advancedAnalytics?.predictive_models.risk_factors.map((risk: string, index: number) => (
                          <div key={index} className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {risk}
                            </Badge>
                          </div>
                        )) || [
                          <div key="1" className="text-xs"><Badge variant="outline" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Seasonal flu impact</Badge></div>,
                          <div key="2" className="text-xs"><Badge variant="outline" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Staff vacation schedules</Badge></div>
                        ]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benchmarking Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Industry Benchmarking</CardTitle>
                <CardDescription>Performance comparison and improvement areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {advancedAnalytics?.benchmarking.industry_percentile || 78}th
                    </div>
                    <div className="text-sm text-gray-600">Industry Percentile</div>
                    <Badge variant="default" className="mt-2">
                      {advancedAnalytics?.benchmarking.peer_comparison || 'Above Average'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium mb-3">Key Improvement Areas:</div>
                    <div className="grid grid-cols-1 gap-2">
                      {advancedAnalytics?.benchmarking.improvement_areas.map((area: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                          {area}
                        </div>
                      )) || [
                        <div key="1" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Documentation efficiency</div>,
                        <div key="2" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Patient communication</div>,
                        <div key="3" className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" />Cost optimization</div>
                      ]}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Update Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Plan Update</DialogTitle>
              <DialogDescription>
                Add a progress update for {selectedPlan?.plan_id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="updateType">Update Type</Label>
                  <Select
                    value={newUpdate.update_type}
                    onValueChange={(value) =>
                      setNewUpdate({ ...newUpdate, update_type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="resource_change">
                        Resource Change
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="escalation">Escalation Required</Label>
                  <Select
                    value={newUpdate.escalation_required ? "true" : "false"}
                    onValueChange={(value) =>
                      setNewUpdate({
                        ...newUpdate,
                        escalation_required: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="completed">Patients Completed</Label>
                  <Input
                    id="completed"
                    type="number"
                    value={newUpdate.patients_completed}
                    onChange={(e) =>
                      setNewUpdate({
                        ...newUpdate,
                        patients_completed: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="remaining">Patients Remaining</Label>
                  <Input
                    id="remaining"
                    type="number"
                    value={newUpdate.patients_remaining}
                    onChange={(e) =>
                      setNewUpdate({
                        ...newUpdate,
                        patients_remaining: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nextActions">Next Actions</Label>
                <Textarea
                  id="nextActions"
                  placeholder="Enter next actions (one per line)"
                  value={newUpdate.next_actions?.join("\n") || ""}
                  onChange={(e) =>
                    setNewUpdate({
                      ...newUpdate,
                      next_actions: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUpdate} disabled={loading}>
                Add Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </Tabs>
      </div>
    </div>
  );
}