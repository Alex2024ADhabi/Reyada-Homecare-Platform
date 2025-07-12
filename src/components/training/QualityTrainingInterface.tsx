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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Brain,
  Users,
  Award,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Lightbulb,
  Search,
  Plus,
  Download,
  Upload,
  Star,
  BarChart3,
  GraduationCap,
  Shield,
  Heart,
  Stethoscope,
  Activity,
} from "lucide-react";

interface CompetencyFramework {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  objectives: string[];
  assessmentCriteria: string[];
  evidenceRequirements: string[];
  aiGenerated: boolean;
  references: string[];
  createdAt: string;
  status: "Draft" | "Published" | "Under Review";
  dohCompliance: {
    standardsAlignment: string[];
    complianceScore: number;
    jawdaIndicators: string[];
    regulatoryRequirements: string[];
  };
  nineDomains: {
    clinicalCare: boolean;
    patientSafety: boolean;
    infectionControl: boolean;
    medicationManagement: boolean;
    documentationStandards: boolean;
    continuityOfCare: boolean;
    patientRights: boolean;
    qualityImprovement: boolean;
    professionalDevelopment: boolean;
  };
  targetRoles: string[];
  competencyType: "clinical" | "administrative" | "technical" | "behavioral";
  validationStatus: "pending" | "validated" | "expired";
  lastReviewDate: string;
  nextReviewDate: string;
  // Enhanced fields for comprehensive competency management
  clinicalSkills: {
    medicationManagement: {
      iv: boolean;
      im: boolean;
      enteral: boolean;
      narcoticAnalgesics: boolean;
    };
    nutritionHydration: {
      ngt: boolean;
      gtJtFeeding: boolean;
      tpn: boolean;
      ivSupplements: boolean;
    };
    respiratoryCare: {
      o2Therapy: boolean;
      bipap: boolean;
      tracheostomy: boolean;
      mechanicalVentilation: boolean;
    };
    skinWoundCare: {
      pressureSores: boolean;
      complexWounds: boolean;
      npwt: boolean;
    };
    bowelBladderCare: {
      catheterManagement: boolean;
      peritonealDialysis: boolean;
    };
    palliativeCare: boolean;
    observationMonitoring: boolean;
    postHospitalTransitional: boolean;
    physiotherapyRehab: boolean;
  };
  assessmentCarePlanning: {
    patientAssessmentWithin3Days: boolean;
    interdisciplinaryTeamCollaboration: boolean;
    carePlanDevelopmentModification: boolean;
    outcomeMeasurementDocumentation: boolean;
  };
  regulatoryLegal: {
    dohLicensingCompliance: boolean;
    patientRightsResponsibilities: boolean;
    documentationStandardsMalaffi: boolean;
    consentProceduresAutonomy: boolean;
    privacyConfidentialityMaintenance: boolean;
    emergencyPreparednessProtocols: boolean;
  };
  communicationCultural: {
    multilingualCapabilities: boolean;
    culturalSensitivityCareDelivery: boolean;
    patientFamilyEducation: boolean;
    interdisciplinaryTeamCommunication: boolean;
    conflictResolutionPatientAdvocacy: boolean;
  };
  technologyDocumentation: {
    electronicMedicalRecordSystems: boolean;
    teleMonitoringServices: boolean;
    digitalHealthPlatforms: boolean;
    qualityReportingJawdaIndicators: boolean;
    dataSecurityPatientPrivacy: boolean;
  };
  safetyRiskManagement: {
    homeEnvironmentRiskAssessment: boolean;
    infectionPreventionControl: boolean;
    equipmentSafetyMaintenance: boolean;
    emergencyResponseProtocols: boolean;
    incidentReportingManagement: boolean;
  };
  highRiskCompetencies: {
    narcoticControlledSubstanceManagement: boolean;
    peritonealDialysisProcedures: boolean;
    mechanicalVentilationManagement: boolean;
    pediatricTracheostomyCareUnder6: boolean;
    complexWoundManagement: boolean;
  };
  technologyIntegration: {
    teleMonitoringCompetencies: boolean;
    electronicHealthRecordProficiency: boolean;
    digitalCommunicationPlatforms: boolean;
    remotePatientMonitoringSystems: boolean;
  };
  culturalLinguisticRequirements: {
    arabicLanguageCompetencies: boolean;
    culturalSensitivityTraining: boolean;
    religiousObservanceConsiderations: boolean;
    familyCenteredCareApproaches: boolean;
  };
}

interface TrainingMaterial {
  id: string;
  title: string;
  type: "Video" | "Document" | "Interactive" | "Assessment" | "Simulation";
  category: string;
  duration: string;
  competencyId?: string;
  completed: boolean;
  rating: number;
  description: string;
  dohAlignment: {
    standardsCompliance: boolean;
    jawdaMapping: string[];
    regulatoryLevel: "basic" | "intermediate" | "advanced";
  };
  learningOutcomes: string[];
  prerequisites: string[];
  certificationEligible: boolean;
  cpdPoints: number;
  evidenceLevel: "A" | "B" | "C" | "D";
  lastUpdated: string;
  version: string;
}

interface RoleRequirement {
  role: "nurse" | "assistant-nurse" | "caregiver" | "therapist" | "supervisor";
  required_level: "novice" | "beginner" | "competent" | "proficient" | "expert";
  mandatory: boolean;
  continuing_education_hours: number;
  assessment_methods: string[];
  peer_review_required: boolean;
}

interface ProficiencyLevel {
  level: "novice" | "beginner" | "competent" | "proficient" | "expert";
  description: string;
  performance_indicators: string[];
  assessment_criteria: string[];
  behavioral_indicators: string[];
  validation_criteria: string[];
}

interface AssessmentMethod {
  method_id: string;
  method_name: string;
  description: string;
  assessment_type:
    | "skills_checklist"
    | "simulation"
    | "portfolio"
    | "peer_review"
    | "written_exam"
    | "practical_exam"
    | "case_study"
    | "direct_observation";
  competency_domains: string[];
  scoring_criteria: ScoringCriteria;
  validity_period_months: number;
  inter_rater_reliability: number;
  content_validity: boolean;
}

interface ScoringCriteria {
  criteria: string[];
  weightage: number;
}

interface ImplementationPhase {
  phase_id: string;
  phase_name: string;
  description: string;
  duration_weeks: number;
  activities: string[];
  deliverables: string[];
  success_criteria: string[];
  responsible_team: string[];
  onboarding_protocols: string[];
  annual_review_requirements: string[];
  remediation_plans: string[];
  career_progression_pathways: string[];
}

interface QualityAssuranceFeatures {
  validation_methods: string[];
  inter_rater_reliability: {
    target_percentage: number;
    measurement_frequency: "monthly" | "quarterly";
    current_percentage: number;
    improvement_actions: string[];
  };
  content_validity: {
    expert_review_completed: boolean;
    validity_coefficient: number;
    last_validation_date: string;
  };
  regulatory_alignment: {
    doh_standards_mapped: boolean;
    jawda_indicators_included: boolean;
    international_standards_aligned: string[];
  };
  continuous_monitoring: {
    kpis: string[];
    reporting_frequency: "weekly" | "monthly";
    automated_alerts: boolean;
  };
  continuous_improvement: {
    feedback_integration: boolean;
    regular_updates: boolean;
    stakeholder_involvement: string[];
  };
  feedback_mechanisms: string[];
}

const QualityTrainingInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState("materials");
  const [competencyFrameworks, setCompetencyFrameworks] = useState<
    CompetencyFramework[]
  >([]);
  const [trainingMaterials, setTrainingMaterials] = useState<
    TrainingMaterial[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCompetency, setNewCompetency] = useState({
    title: "",
    description: "",
    category: "",
    level: "Novice" as const,
    objectives: [""],
    evidenceRequirements: [""],
  });

  // Initialize with comprehensive DOH-aligned sample data
  useEffect(() => {
    const sampleMaterials: TrainingMaterial[] = [
      {
        id: "1",
        title: "DOH Home Healthcare Standards V2/2024 - Comprehensive Overview",
        type: "Video",
        category: "Compliance",
        duration: "45 min",
        completed: true,
        rating: 4.8,
        description:
          "Comprehensive overview of Abu Dhabi DOH healthcare standards and compliance requirements for home healthcare services",
        dohAlignment: {
          standardsCompliance: true,
          jawdaMapping: [
            "Patient Safety",
            "Clinical Governance",
            "Quality Management",
          ],
          regulatoryLevel: "advanced",
        },
        learningOutcomes: [
          "Understand DOH V2/2024 standards framework",
          "Apply nine domains of care in practice",
          "Implement quality indicators effectively",
        ],
        prerequisites: [
          "Basic healthcare knowledge",
          "UAE healthcare system familiarity",
        ],
        certificationEligible: true,
        cpdPoints: 5,
        evidenceLevel: "A",
        lastUpdated: "2024-01-15",
        version: "2.1",
      },
      {
        id: "2",
        title: "Patient Safety Taxonomy & Incident Prevention",
        type: "Interactive",
        category: "Safety",
        duration: "30 min",
        completed: false,
        rating: 4.9,
        description:
          "Interactive training on DOH patient safety taxonomy, incident prevention, and reporting protocols",
        dohAlignment: {
          standardsCompliance: true,
          jawdaMapping: [
            "Patient Safety",
            "Risk Management",
            "Incident Reporting",
          ],
          regulatoryLevel: "intermediate",
        },
        learningOutcomes: [
          "Apply patient safety taxonomy correctly",
          "Implement incident prevention strategies",
          "Execute proper reporting procedures",
        ],
        prerequisites: ["Basic patient care knowledge"],
        certificationEligible: true,
        cpdPoints: 3,
        evidenceLevel: "A",
        lastUpdated: "2024-01-10",
        version: "1.8",
      },
      {
        id: "3",
        title: "Clinical Documentation Best Practices",
        type: "Document",
        category: "Documentation",
        duration: "20 min",
        completed: true,
        rating: 4.7,
        description:
          "Evidence-based practices for clinical documentation and record keeping",
      },
      {
        id: "4",
        title: "Infection Control Procedures",
        type: "Simulation",
        category: "Safety",
        duration: "60 min",
        completed: false,
        rating: 4.6,
        description:
          "Hands-on simulation training for infection control and prevention",
      },
      {
        id: "5",
        title: "JAWDA Quality Indicators",
        type: "Assessment",
        category: "Quality",
        duration: "25 min",
        completed: true,
        rating: 4.5,
        description:
          "Assessment module covering JAWDA quality indicators and metrics",
      },
      {
        id: "6",
        title: "Emergency Response Protocols",
        type: "Video",
        category: "Emergency",
        duration: "35 min",
        completed: false,
        rating: 4.8,
        description:
          "Emergency response procedures and crisis management protocols",
      },
      {
        id: "7",
        title: "Medication Management",
        type: "Interactive",
        category: "Clinical",
        duration: "40 min",
        completed: true,
        rating: 4.7,
        description: "Safe medication administration and management practices",
      },
      {
        id: "8",
        title: "Cultural Competency in Healthcare",
        type: "Document",
        category: "Cultural",
        duration: "30 min",
        completed: false,
        rating: 4.6,
        description: "Understanding cultural diversity in healthcare delivery",
      },
    ];

    const sampleFrameworks: CompetencyFramework[] = [
      {
        id: "1",
        title: "Advanced Wound Care Management - DOH Compliant",
        description:
          "Comprehensive competency framework for advanced wound assessment and treatment aligned with Abu Dhabi DOH standards",
        category: "Clinical",
        level: "Advanced",
        objectives: [
          "Perform comprehensive wound assessment using DOH-approved protocols",
          "Select appropriate wound care products based on evidence-based guidelines",
          "Develop individualized treatment plans following nine domains of care",
          "Monitor healing progress and adjust care using JAWDA indicators",
          "Document wound care according to DOH documentation standards",
        ],
        assessmentCriteria: [
          "Accurate wound assessment documentation meeting DOH standards",
          "Appropriate product selection with clinical rationale",
          "Evidence-based treatment planning incorporating patient preferences",
          "Effective patient and family education delivery",
          "Compliance with infection control protocols",
        ],
        evidenceRequirements: [
          "Complete 5 supervised wound assessments with DOH-compliant documentation",
          "Document 3 treatment plan modifications with outcome measures",
          "Demonstrate patient education session with cultural competency",
          "Pass written assessment on wound care protocols (≥85%)",
        ],
        aiGenerated: true,
        references: [
          "Department of Health Abu Dhabi. (2024). Standards for Home Healthcare Services V2/2024.",
          "JAWDA. (2024). Quality Indicators Framework for Healthcare Providers.",
          "International Council of Nurses. (2023). ICN Framework of Competencies for the Nurse Specialist.",
          "World Health Organization. (2023). Patient Safety Curriculum Guide: Multi-professional Edition.",
          "Cochrane Collaboration. (2024). Evidence-based Practice in Healthcare.",
          "UAE Ministry of Health and Prevention. (2024). National Clinical Guidelines.",
          "Joint Commission International. (2024). Accreditation Standards for Healthcare Organizations.",
        ],
        createdAt: "2024-01-15",
        status: "Published",
        dohCompliance: {
          standardsAlignment: [
            "Clinical Care Standards",
            "Documentation Requirements",
            "Patient Safety",
          ],
          complianceScore: 95,
          jawdaIndicators: [
            "Clinical Effectiveness",
            "Patient Safety",
            "Patient Experience",
          ],
          regulatoryRequirements: [
            "Licensed practitioner supervision",
            "Continuing education",
            "Quality assurance",
          ],
        },
        nineDomains: {
          clinicalCare: true,
          patientSafety: true,
          infectionControl: true,
          medicationManagement: false,
          documentationStandards: true,
          continuityOfCare: true,
          patientRights: true,
          qualityImprovement: true,
          professionalDevelopment: true,
        },
        targetRoles: [
          "Registered Nurse",
          "Wound Care Specialist",
          "Clinical Supervisor",
        ],
        competencyType: "clinical",
        validationStatus: "validated",
        lastReviewDate: "2024-01-15",
        nextReviewDate: "2024-07-15",
        // Enhanced comprehensive competency fields
        clinicalSkills: {
          medicationManagement: {
            iv: true,
            im: true,
            enteral: false,
            narcoticAnalgesics: false,
          },
          nutritionHydration: {
            ngt: false,
            gtJtFeeding: false,
            tpn: false,
            ivSupplements: true,
          },
          respiratoryCare: {
            o2Therapy: false,
            bipap: false,
            tracheostomy: false,
            mechanicalVentilation: false,
          },
          skinWoundCare: {
            pressureSores: true,
            complexWounds: true,
            npwt: true,
          },
          bowelBladderCare: {
            catheterManagement: false,
            peritonealDialysis: false,
          },
          palliativeCare: false,
          observationMonitoring: true,
          postHospitalTransitional: false,
          physiotherapyRehab: false,
        },
        assessmentCarePlanning: {
          patientAssessmentWithin3Days: true,
          interdisciplinaryTeamCollaboration: true,
          carePlanDevelopmentModification: true,
          outcomeMeasurementDocumentation: true,
        },
        regulatoryLegal: {
          dohLicensingCompliance: true,
          patientRightsResponsibilities: true,
          documentationStandardsMalaffi: true,
          consentProceduresAutonomy: true,
          privacyConfidentialityMaintenance: true,
          emergencyPreparednessProtocols: false,
        },
        communicationCultural: {
          multilingualCapabilities: true,
          culturalSensitivityCareDelivery: true,
          patientFamilyEducation: true,
          interdisciplinaryTeamCommunication: true,
          conflictResolutionPatientAdvocacy: false,
        },
        technologyDocumentation: {
          electronicMedicalRecordSystems: true,
          teleMonitoringServices: false,
          digitalHealthPlatforms: true,
          qualityReportingJawdaIndicators: true,
          dataSecurityPatientPrivacy: true,
        },
        safetyRiskManagement: {
          homeEnvironmentRiskAssessment: true,
          infectionPreventionControl: true,
          equipmentSafetyMaintenance: true,
          emergencyResponseProtocols: false,
          incidentReportingManagement: true,
        },
        highRiskCompetencies: {
          narcoticControlledSubstanceManagement: false,
          peritonealDialysisProcedures: false,
          mechanicalVentilationManagement: false,
          pediatricTracheostomyCareUnder6: false,
          complexWoundManagement: true,
        },
        technologyIntegration: {
          teleMonitoringCompetencies: false,
          electronicHealthRecordProficiency: true,
          digitalCommunicationPlatforms: true,
          remotePatientMonitoringSystems: false,
        },
        culturalLinguisticRequirements: {
          arabicLanguageCompetencies: true,
          culturalSensitivityTraining: true,
          religiousObservanceConsiderations: true,
          familyCenteredCareApproaches: true,
        },
      },
      {
        id: "2",
        title: "Pediatric Home Care Competency - DOH Specialized Framework",
        description:
          "Specialized competency framework for pediatric home healthcare delivery aligned with Abu Dhabi DOH pediatric care standards",
        category: "Pediatric",
        level: "Intermediate",
        objectives: [
          "Assess pediatric developmental milestones using standardized tools",
          "Implement age-appropriate care strategies following DOH pediatric guidelines",
          "Communicate effectively with families using cultural competency principles",
          "Recognize pediatric emergency situations and execute appropriate protocols",
          "Ensure child protection and safeguarding compliance",
        ],
        assessmentCriteria: [
          "Accurate developmental assessment using validated screening tools",
          "Age-appropriate care delivery with family-centered approach",
          "Effective family communication demonstrating cultural sensitivity",
          "Timely emergency recognition with appropriate escalation",
          "Compliance with child protection protocols",
        ],
        evidenceRequirements: [
          "Complete pediatric assessment portfolio with 10 cases",
          "Family feedback evaluation (≥4.5/5.0 satisfaction)",
          "Emergency response simulation with passing score",
          "Child protection training certification",
        ],
        aiGenerated: false,
        references: [
          "Abu Dhabi DOH Pediatric Care Standards 2024",
          "AAP Pediatric Care Guidelines",
          "WHO Child Health Standards",
          "UAE Child Protection Framework",
        ],
        createdAt: "2024-01-10",
        status: "Published",
        dohCompliance: {
          standardsAlignment: [
            "Pediatric Care Standards",
            "Family-Centered Care",
            "Child Protection",
          ],
          complianceScore: 92,
          jawdaIndicators: [
            "Patient Safety",
            "Clinical Effectiveness",
            "Patient Experience",
          ],
          regulatoryRequirements: [
            "Pediatric certification",
            "Child protection training",
            "Family counseling skills",
          ],
        },
        nineDomains: {
          clinicalCare: true,
          patientSafety: true,
          infectionControl: true,
          medicationManagement: true,
          documentationStandards: true,
          continuityOfCare: true,
          patientRights: true,
          qualityImprovement: false,
          professionalDevelopment: true,
        },
        targetRoles: [
          "Pediatric Nurse",
          "Family Care Coordinator",
          "Child Health Specialist",
        ],
        competencyType: "clinical",
        validationStatus: "validated",
        lastReviewDate: "2024-01-10",
        nextReviewDate: "2024-07-10",
      },
    ];

    setTrainingMaterials(sampleMaterials);
    setCompetencyFrameworks(sampleFrameworks);
  }, []);

  const handleGenerateCompetency = async () => {
    if (!newCompetency.title || !newCompetency.description) {
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation process
    setTimeout(() => {
      const aiGeneratedFramework: CompetencyFramework = {
        id: Date.now().toString(),
        title: newCompetency.title,
        description: newCompetency.description,
        category: newCompetency.category || "General",
        level: newCompetency.level,
        objectives: newCompetency.objectives.filter((obj) => obj.trim() !== ""),
        assessmentCriteria: [
          `Demonstrate proficiency in ${newCompetency.title.toLowerCase()}`,
          "Apply evidence-based practices consistently",
          "Meet quality standards and safety requirements",
          "Show continuous improvement and learning",
          "Maintain DOH compliance standards",
          "Demonstrate cultural competency and patient-centered care",
        ],
        evidenceRequirements: newCompetency.evidenceRequirements.filter(
          (req) => req.trim() !== "",
        ),
        aiGenerated: true,
        references: [
          "Department of Health Abu Dhabi. (2024). Standards for Home Healthcare Services V2/2024.",
          "JAWDA. (2024). Quality Indicators Framework for Healthcare Providers.",
          "International Council of Nurses. (2023). ICN Framework of Competencies for the Nurse Specialist.",
          "World Health Organization. (2023). Patient Safety Curriculum Guide: Multi-professional Edition.",
          "Cochrane Collaboration. (2024). Evidence-based Practice in Healthcare.",
          "UAE Ministry of Health and Prevention. (2024). National Clinical Guidelines.",
          "Joint Commission International. (2024). Accreditation Standards for Healthcare Organizations.",
        ],
        createdAt: new Date().toISOString().split("T")[0],
        status: "Draft",
        dohCompliance: {
          standardsAlignment: [
            "Clinical Care Standards",
            "Documentation Requirements",
            "Patient Safety",
            "Quality Management",
          ],
          complianceScore: 85,
          jawdaIndicators: [
            "Clinical Effectiveness",
            "Patient Safety",
            "Patient Experience",
          ],
          regulatoryRequirements: [
            "Licensed practitioner supervision",
            "Continuing education",
            "Quality assurance",
            "Performance monitoring",
          ],
        },
        nineDomains: {
          clinicalCare: true,
          patientSafety: true,
          infectionControl: false,
          medicationManagement: false,
          documentationStandards: true,
          continuityOfCare: true,
          patientRights: true,
          qualityImprovement: true,
          professionalDevelopment: true,
        },
        targetRoles: [
          "Registered Nurse",
          "Healthcare Assistant",
          "Clinical Supervisor",
        ],
        competencyType: "clinical",
        validationStatus: "pending",
        lastReviewDate: new Date().toISOString().split("T")[0],
        nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };

      setCompetencyFrameworks((prev) => [aiGeneratedFramework, ...prev]);
      setNewCompetency({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        objectives: [""],
        evidenceRequirements: [""],
      });
      setIsGenerating(false);
      setActiveTab("competencies");
    }, 3000);
  };

  const addObjective = () => {
    setNewCompetency((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const addEvidenceRequirement = () => {
    setNewCompetency((prev) => ({
      ...prev,
      evidenceRequirements: [...prev.evidenceRequirements, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setNewCompetency((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const updateEvidenceRequirement = (index: number, value: string) => {
    setNewCompetency((prev) => ({
      ...prev,
      evidenceRequirements: prev.evidenceRequirements.map((req, i) =>
        i === index ? value : req,
      ),
    }));
  };

  const filteredMaterials = trainingMaterials.filter((material) => {
    const matchesCategory =
      selectedCategory === "all" ||
      material.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFrameworks = competencyFrameworks.filter((framework) => {
    const matchesCategory =
      selectedCategory === "all" ||
      framework.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      framework.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Activity className="h-4 w-4" />;
      case "Document":
        return <FileText className="h-4 w-4" />;
      case "Interactive":
        return <Target className="h-4 w-4" />;
      case "Assessment":
        return <CheckCircle className="h-4 w-4" />;
      case "Simulation":
        return <Brain className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "clinical":
        return <Stethoscope className="h-4 w-4" />;
      case "safety":
        return <Shield className="h-4 w-4" />;
      case "quality":
        return <Award className="h-4 w-4" />;
      case "compliance":
        return <CheckCircle className="h-4 w-4" />;
      case "emergency":
        return <Heart className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quality Training Interface
              </h1>
              <p className="text-gray-600">
                AI-Powered Competency Builder & Training Management
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search training materials and competencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="pediatric">Pediatric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training Materials
            </TabsTrigger>
            <TabsTrigger
              value="competencies"
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Competency Frameworks
            </TabsTrigger>
            <TabsTrigger value="ai-builder" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Competency Builder
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Training Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        <Badge variant="secondary">{material.type}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {material.rating}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(material.category)}
                        <span className="text-sm text-gray-600">
                          {material.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {material.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          CPD: {material.cpdPoints || 0} pts
                        </Badge>
                        <Badge
                          variant={
                            material.dohAlignment?.standardsCompliance
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          DOH{" "}
                          {material.dohAlignment?.standardsCompliance
                            ? "Compliant"
                            : "Aligned"}
                        </Badge>
                      </div>
                    </div>
                    {material.completed && (
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          Completed
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      variant={material.completed ? "outline" : "default"}
                    >
                      {material.completed ? "Review" : "Start Training"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Competency Frameworks Tab */}
          <TabsContent value="competencies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFrameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(framework.category)}
                        <Badge variant="outline">{framework.category}</Badge>
                        <Badge
                          variant={
                            framework.level === "Expert"
                              ? "destructive"
                              : framework.level === "Advanced"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {framework.level}
                        </Badge>
                      </div>
                      {framework.aiGenerated && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{framework.title}</CardTitle>
                    <CardDescription>{framework.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Learning Objectives
                      </h4>
                      <ul className="space-y-1">
                        {framework.objectives
                          .slice(0, 3)
                          .map((objective, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        {framework.objectives.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{framework.objectives.length - 3} more objectives
                          </li>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          DOH Compliance
                        </h4>
                        <Badge variant="default" className="text-xs">
                          {framework.dohCompliance?.complianceScore || 0}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {framework.dohCompliance?.jawdaIndicators
                          .slice(0, 2)
                          .map((indicator, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {indicator}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            framework.status === "Published"
                              ? "default"
                              : framework.status === "Under Review"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {framework.status}
                        </Badge>
                        <Badge
                          variant={
                            framework.validationStatus === "validated"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {framework.validationStatus}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {framework.createdAt}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Competency Builder Tab */}
          <TabsContent value="ai-builder" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>AI-Powered Competency Builder</CardTitle>
                    <CardDescription>
                      Create evidence-based competency frameworks using AI
                      assistance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isGenerating && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      AI is generating your competency framework based on
                      evidence-based practices and best practices...
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Competency Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Advanced Cardiac Care Management"
                        value={newCompetency.title}
                        onChange={(e) =>
                          setNewCompetency((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the competency scope and purpose..."
                        value={newCompetency.description}
                        onChange={(e) =>
                          setNewCompetency((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">DOH Care Domain</Label>
                        <Select
                          value={newCompetency.category}
                          onValueChange={(value) =>
                            setNewCompetency((prev) => ({
                              ...prev,
                              category: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select DOH care domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Clinical Care">
                              Clinical Care & Assessment
                            </SelectItem>
                            <SelectItem value="Patient Safety">
                              Patient Safety & Risk Management
                            </SelectItem>
                            <SelectItem value="Infection Control">
                              Infection Prevention & Control
                            </SelectItem>
                            <SelectItem value="Medication Management">
                              Medication Management
                            </SelectItem>
                            <SelectItem value="Documentation">
                              Documentation Standards
                            </SelectItem>
                            <SelectItem value="Continuity of Care">
                              Continuity of Care
                            </SelectItem>
                            <SelectItem value="Patient Rights">
                              Patient Rights & Ethics
                            </SelectItem>
                            <SelectItem value="Quality Improvement">
                              Quality Improvement
                            </SelectItem>
                            <SelectItem value="Professional Development">
                              Professional Development
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="level">Competency Level</Label>
                        <Select
                          value={newCompetency.level}
                          onValueChange={(value: any) =>
                            setNewCompetency((prev) => ({
                              ...prev,
                              level: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Novice">Novice</SelectItem>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Learning Objectives</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addObjective}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newCompetency.objectives.map((objective, index) => (
                          <Input
                            key={index}
                            placeholder={`Objective ${index + 1}`}
                            value={objective}
                            onChange={(e) =>
                              updateObjective(index, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Evidence Requirements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEvidenceRequirement}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newCompetency.evidenceRequirements.map(
                          (requirement, index) => (
                            <Input
                              key={index}
                              placeholder={`Evidence requirement ${index + 1}`}
                              value={requirement}
                              onChange={(e) =>
                                updateEvidenceRequirement(index, e.target.value)
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="evidence-based" defaultChecked />
                      <Label htmlFor="evidence-based" className="text-sm">
                        Use evidence-based practices
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="doh-compliance" defaultChecked />
                      <Label htmlFor="doh-compliance" className="text-sm">
                        Ensure DOH V2/2024 compliance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="jawda-alignment" defaultChecked />
                      <Label htmlFor="jawda-alignment" className="text-sm">
                        Include JAWDA indicators
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateCompetency}
                    disabled={
                      !newCompetency.title ||
                      !newCompetency.description ||
                      isGenerating
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Competency
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Features Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        JAWDA Quality Framework
                      </h4>
                      <p className="text-xs text-gray-600">
                        Integrated with JAWDA quality indicators
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        DOH Standards Aligned
                      </h4>
                      <p className="text-xs text-gray-600">
                        Compliant with Abu Dhabi DOH V2/2024 standards
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Nine Domains Coverage
                      </h4>
                      <p className="text-xs text-gray-600">
                        Comprehensive coverage of DOH nine care domains
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        5-Level Performance
                      </h4>
                      <p className="text-xs text-gray-600">
                        Novice to Expert progression pathway
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Materials
                      </p>
                      <p className="text-2xl font-bold">
                        {trainingMaterials.length}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Competency Frameworks
                      </p>
                      <p className="text-2xl font-bold">
                        {competencyFrameworks.length}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        AI Generated
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          competencyFrameworks.filter((f) => f.aiGenerated)
                            .length
                        }
                      </p>
                    </div>
                    <Brain className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Training Progress Overview</CardTitle>
                <CardDescription>
                  Track completion rates across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Clinical", "Safety", "Quality", "Compliance"].map(
                    (category) => {
                      const categoryMaterials = trainingMaterials.filter(
                        (m) => m.category === category,
                      );
                      const completed = categoryMaterials.filter(
                        (m) => m.completed,
                      ).length;
                      const percentage =
                        categoryMaterials.length > 0
                          ? (completed / categoryMaterials.length) * 100
                          : 0;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-gray-600">
                              {completed}/{categoryMaterials.length} completed
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QualityTrainingInterface;
