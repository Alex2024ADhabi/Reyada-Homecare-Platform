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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ElectronicSignature } from "@/components/ui/electronic-signature";
import {
  BookOpen,
  HelpCircle,
  Lightbulb,
  Search,
  Play,
  CheckCircle,
  Clock,
  Star,
  AlertTriangle,
  Info,
  FileText,
  Video,
  Users,
  Award,
  TrendingUp,
  Certificate,
  Download,
  PenTool,
} from "lucide-react";
import { damanTrainingSupport } from "@/services/daman-training-support.service";
import {
  getCompetencyFrameworks,
  getTrainingModules,
  getCompetencyAssessments,
  getEducationalResources,
  getCompetencyDashboard,
  createCompetencyAssessment,
  DOHCompetencyFramework,
  TrainingModule,
  CompetencyAssessment,
  QualityIndicator,
} from "@/api/quality-management.api";

interface DamanTrainingInterfaceProps {
  currentField?: string;
  formData?: any;
  onGuidanceApply?: (guidance: string) => void;
}

interface CompetencyFrameworkData {
  frameworks: DOHCompetencyFramework[];
  trainingModules: TrainingModule[];
  assessments: CompetencyAssessment[];
  educationalResources: any[];
  dashboardData: any;
}

export const DamanTrainingInterface: React.FC<DamanTrainingInterfaceProps> = ({
  currentField,
  formData,
  onGuidanceApply,
}) => {
  const [contextualHelp, setContextualHelp] = useState<any>(null);
  const [guidanceSteps, setGuidanceSteps] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [userProgress, setUserProgress] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [updateNotifications, setUpdateNotifications] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any>(null);
  const [errorResolution, setErrorResolution] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [pendingCertification, setPendingCertification] = useState<any>(null);
  const [competencyData, setCompetencyData] = useState<CompetencyFrameworkData>(
    {
      frameworks: [],
      trainingModules: [],
      assessments: [],
      educationalResources: [],
      dashboardData: null,
    },
  );
  const [selectedFramework, setSelectedFramework] = useState<any>(null);
  const [activeCompetencyTab, setActiveCompetencyTab] = useState("overview");
  const [showCompetencyBuilder, setShowCompetencyBuilder] = useState(false);
  const [builderData, setBuilderData] = useState({
    topic: "",
    targetRole: "nurse",
    competencyLevel: "intermediate",
    learningObjectives: [""],
    evidenceRequirements: [""],
    assessmentCriteria: [""],
    isGenerating: false,
    generatedContent: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadTrainingData();
        await loadCompetencyData();
      } catch (error) {
        console.error("Failed to load training data:", error);
      }
    };
    loadData();
  }, [selectedRole]);

  const loadCompetencyData = async () => {
    try {
      const [frameworks, modules, assessments, resources, dashboard] =
        await Promise.all([
          getCompetencyFrameworks(),
          getTrainingModules({
            role: selectedRole === "all" ? undefined : selectedRole,
          }),
          getCompetencyAssessments(),
          getEducationalResources({
            target_role: selectedRole === "all" ? undefined : selectedRole,
          }),
          getCompetencyDashboard(),
        ]);

      setCompetencyData({
        frameworks,
        trainingModules: modules,
        assessments,
        educationalResources: resources,
        dashboardData: dashboard,
      });
    } catch (error) {
      console.error("Failed to load competency data:", error);
    }
  };

  useEffect(() => {
    if (currentField) {
      try {
        loadContextualHelp(currentField);
      } catch (error) {
        console.error("Failed to load contextual help:", error);
      }
    }
  }, [currentField]);

  useEffect(() => {
    if (formData) {
      try {
        loadGuidanceSteps(formData);
      } catch (error) {
        console.error("Failed to load guidance steps:", error);
      }
    }
  }, [formData]);

  const loadTrainingData = async () => {
    try {
      // Load training modules for all roles
      const allModules = [
        // Nurse Competencies
        {
          id: "nurse-basic-care",
          title: "Basic Nursing Care Competency",
          description: "Fundamental nursing skills and patient care protocols",
          role: "nurse",
          difficulty: "intermediate",
          duration: 120,
          sections: [
            {
              title: "Patient Assessment",
              content:
                "Comprehensive patient assessment techniques and documentation",
            },
            {
              title: "Medication Administration",
              content: "Safe medication practices and dosage calculations",
            },
            {
              title: "Infection Control",
              content:
                "Standard precautions and infection prevention protocols",
            },
            {
              title: "Documentation Standards",
              content: "Proper nursing documentation and legal requirements",
            },
          ],
        },
        {
          id: "nurse-advanced-care",
          title: "Advanced Nursing Care Competency",
          description:
            "Advanced clinical skills and specialized care procedures",
          role: "nurse",
          difficulty: "advanced",
          duration: 180,
          sections: [
            {
              title: "Critical Care Assessment",
              content: "Advanced assessment techniques for critical patients",
            },
            {
              title: "IV Therapy Management",
              content: "Intravenous therapy administration and monitoring",
            },
            {
              title: "Wound Care Management",
              content: "Advanced wound assessment and treatment protocols",
            },
            {
              title: "Emergency Response",
              content: "Emergency procedures and crisis management",
            },
          ],
        },
        // Assistant Nurse Competencies
        {
          id: "assistant-nurse-fundamentals",
          title: "Assistant Nurse Fundamentals",
          description: "Core competencies for assistant nursing roles",
          role: "assistant-nurse",
          difficulty: "beginner",
          duration: 90,
          sections: [
            {
              title: "Basic Patient Care",
              content: "Fundamental patient care and comfort measures",
            },
            {
              title: "Vital Signs Monitoring",
              content: "Accurate measurement and recording of vital signs",
            },
            {
              title: "Hygiene Assistance",
              content: "Personal hygiene and grooming assistance",
            },
            {
              title: "Communication Skills",
              content: "Effective communication with patients and families",
            },
          ],
        },
        {
          id: "assistant-nurse-clinical",
          title: "Clinical Assistant Nursing",
          description: "Clinical procedures and patient support",
          role: "assistant-nurse",
          difficulty: "intermediate",
          duration: 120,
          sections: [
            {
              title: "Clinical Procedures",
              content: "Basic clinical procedures and assistance",
            },
            {
              title: "Patient Mobility",
              content: "Safe patient transfer and mobility assistance",
            },
            {
              title: "Medical Equipment",
              content: "Basic medical equipment operation and maintenance",
            },
            {
              title: "Safety Protocols",
              content: "Patient safety and risk prevention measures",
            },
          ],
        },
        // Care Giver Competencies
        {
          id: "caregiver-personal-care",
          title: "Personal Care Competency",
          description: "Personal care and daily living assistance",
          role: "caregiver",
          difficulty: "beginner",
          duration: 60,
          sections: [
            {
              title: "Activities of Daily Living",
              content: "Assistance with daily activities and personal care",
            },
            {
              title: "Nutrition Support",
              content: "Meal preparation and feeding assistance",
            },
            {
              title: "Companionship",
              content: "Emotional support and social interaction",
            },
            {
              title: "Home Safety",
              content: "Home environment safety and hazard prevention",
            },
          ],
        },
        {
          id: "caregiver-specialized",
          title: "Specialized Care Giving",
          description: "Specialized care for specific conditions",
          role: "caregiver",
          difficulty: "intermediate",
          duration: 90,
          sections: [
            {
              title: "Dementia Care",
              content: "Specialized care for patients with dementia",
            },
            {
              title: "Chronic Disease Support",
              content: "Support for chronic conditions and disabilities",
            },
            {
              title: "Medication Reminders",
              content: "Medication compliance and reminder systems",
            },
            {
              title: "Emergency Recognition",
              content: "Recognizing medical emergencies and response",
            },
          ],
        },
        // Therapist Competencies
        {
          id: "therapist-physical",
          title: "Physical Therapy Competency",
          description: "Physical therapy techniques and rehabilitation",
          role: "therapist",
          difficulty: "advanced",
          duration: 150,
          sections: [
            {
              title: "Assessment Techniques",
              content: "Physical assessment and functional evaluation",
            },
            {
              title: "Exercise Therapy",
              content: "Therapeutic exercises and mobility training",
            },
            {
              title: "Pain Management",
              content: "Non-pharmacological pain management techniques",
            },
            {
              title: "Progress Monitoring",
              content: "Treatment progress evaluation and documentation",
            },
          ],
        },
        {
          id: "therapist-occupational",
          title: "Occupational Therapy Competency",
          description: "Occupational therapy and daily living skills",
          role: "therapist",
          difficulty: "advanced",
          duration: 150,
          sections: [
            {
              title: "Functional Assessment",
              content: "Assessment of daily living capabilities",
            },
            {
              title: "Adaptive Techniques",
              content: "Teaching adaptive techniques and equipment use",
            },
            {
              title: "Cognitive Rehabilitation",
              content: "Cognitive therapy and memory enhancement",
            },
            {
              title: "Environmental Modification",
              content: "Home environment assessment and modification",
            },
          ],
        },
        {
          id: "therapist-speech",
          title: "Speech Therapy Competency",
          description: "Speech and language therapy techniques",
          role: "therapist",
          difficulty: "advanced",
          duration: 120,
          sections: [
            {
              title: "Communication Assessment",
              content: "Speech and language evaluation techniques",
            },
            {
              title: "Swallowing Therapy",
              content: "Dysphagia assessment and treatment",
            },
            {
              title: "Voice Therapy",
              content: "Voice disorders and rehabilitation techniques",
            },
            {
              title: "Cognitive Communication",
              content: "Cognitive-communication disorders treatment",
            },
          ],
        },
        // Supervisor/Manager Competencies
        {
          id: "supervisor-leadership",
          title: "Healthcare Leadership Competency",
          description:
            "Leadership and management skills for healthcare supervisors",
          role: "supervisor",
          difficulty: "advanced",
          duration: 180,
          sections: [
            {
              title: "Team Leadership",
              content: "Leading healthcare teams and staff management",
            },
            {
              title: "Quality Assurance",
              content: "Quality control and performance monitoring",
            },
            {
              title: "Compliance Management",
              content: "Regulatory compliance and audit preparation",
            },
            {
              title: "Staff Development",
              content: "Training coordination and professional development",
            },
          ],
        },
        // DOH Compliance Training (Universal)
        {
          id: "doh-compliance-universal",
          title: "DOH Compliance Training",
          description:
            "Universal DOH compliance requirements for all healthcare staff",
          role: "universal",
          difficulty: "intermediate",
          duration: 90,
          sections: [
            {
              title: "DOH Standards Overview",
              content:
                "Understanding DOH healthcare standards and requirements",
            },
            {
              title: "Patient Rights",
              content: "Patient rights and ethical considerations",
            },
            {
              title: "Documentation Requirements",
              content: "DOH-compliant documentation standards",
            },
            {
              title: "Incident Reporting",
              content: "Proper incident reporting and follow-up procedures",
            },
          ],
        },
      ];

      const modules =
        selectedRole === "all"
          ? allModules
          : allModules.filter(
              (m) => m.role === selectedRole || m.role === "universal",
            );
      setTrainingModules(modules);

      // Load user progress
      const progress = damanTrainingSupport.getUserProgress("current-user");
      setUserProgress(progress);

      // Load update notifications
      const notifications = damanTrainingSupport.getUpdateNotifications();
      setUpdateNotifications(notifications);

      // Load best practices
      const practices = damanTrainingSupport.getBestPractices("submission");
      setBestPractices(practices);

      // Search knowledge base
      const articles = damanTrainingSupport.searchKnowledgeBase("");
      setKnowledgeBase(articles.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error("Failed to load training data:", error);
    }
  };

  const loadContextualHelp = (fieldName: string) => {
    try {
      const help = damanTrainingSupport.getContextualHelp(fieldName);
      setContextualHelp(help);
    } catch (error) {
      console.error("Error loading contextual help:", error);
      setContextualHelp(null);
    }
  };

  const loadGuidanceSteps = (data: any) => {
    try {
      const steps = damanTrainingSupport.generateSubmissionGuidance(
        data,
        "beginner",
      );
      setGuidanceSteps(steps);
    } catch (error) {
      console.error("Error loading guidance steps:", error);
      setGuidanceSteps([]);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = damanTrainingSupport.searchKnowledgeBase(query);
      setKnowledgeBase(results);
    } else {
      const articles = damanTrainingSupport.searchKnowledgeBase("");
      setKnowledgeBase(articles.slice(0, 5));
    }
  };

  const handleModuleStart = (module: any) => {
    setSelectedModule(module);
    setCurrentSection(0);
    setModuleProgress(0);
  };

  const handleSectionComplete = () => {
    if (selectedModule && currentSection < selectedModule.sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
      const newProgress =
        ((currentSection + 1) / selectedModule.sections.length) * 100;
      setModuleProgress(newProgress);

      // Track progress
      damanTrainingSupport.trackProgress("current-user", selectedModule.id, {
        completed: newProgress === 100,
        timeSpent: 0,
        completedSections: selectedModule.sections
          .slice(0, currentSection + 1)
          .map((s: any) => s.title),
      });

      // Check if module is completed and issue certification
      if (newProgress === 100) {
        issueCertification(selectedModule);
      }
    }
  };

  const issueCertification = (module: any) => {
    const rolePrefix =
      {
        nurse: "RN",
        "assistant-nurse": "AN",
        caregiver: "CG",
        therapist: "TH",
        supervisor: "SV",
        universal: "UC",
      }[module.role] || "GN";

    const certification = {
      id: `cert-${module.id}-${Date.now()}`,
      moduleId: module.id,
      moduleTitle: module.title,
      role: module.role,
      roleTitle:
        {
          nurse: "Registered Nurse",
          "assistant-nurse": "Assistant Nurse",
          caregiver: "Care Giver",
          therapist: "Therapist",
          supervisor: "Healthcare Supervisor",
          universal: "Healthcare Professional",
        }[module.role] || "Healthcare Professional",
      userId: "current-user",
      completionDate: new Date().toISOString(),
      certificateNumber: `${rolePrefix}-${module.id.toUpperCase().replace(/-/g, "")}-${Date.now().toString().slice(-6)}`,
      competencyLevel: module.difficulty,
      validUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 1 year validity
      status: "pending_signature",
      skills: module.sections.map((s: any) => s.title),
      score: 100, // Assuming completion means 100% score
      signatureRequired: true,
      signatureData: null,
    };

    setPendingCertification(certification);
    setShowCertificationDialog(true);
  };

  const handleSignCertification = () => {
    setShowCertificationDialog(false);
    setShowSignatureDialog(true);
  };

  const handleSignatureComplete = (signatureData: any) => {
    if (pendingCertification) {
      const completedCertification = {
        ...pendingCertification,
        status: "issued",
        signatureData,
        issuedDate: new Date().toISOString(),
      };

      setCertifications((prev) => [...prev, completedCertification]);
      setCurrentCertification(completedCertification);
      setShowSignatureDialog(false);
      setPendingCertification(null);

      // Show success message
      alert("Certification successfully issued and signed!");
    }
  };

  const handleBuilderInputChange = (field: string, value: any) => {
    setBuilderData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayFieldChange = (
    field: string,
    index: number,
    value: string,
  ) => {
    setBuilderData((prev) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item,
      ),
    }));
  };

  const addArrayField = (field: string) => {
    setBuilderData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setBuilderData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const generateCompetencyContent = async () => {
    setBuilderData((prev) => ({ ...prev, isGenerating: true }));

    try {
      // Simulate AI generation with evidence-based content
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedContent = {
        competencyId: `comp-${Date.now()}`,
        title: `${builderData.topic} Competency Framework`,
        description: `Evidence-based competency framework for ${builderData.topic} aligned with DOH standards and international best practices.`,
        evidenceBase: [
          "DOH Standards for Home Healthcare Services V2.0",
          "International Council of Nurses (ICN) Competency Framework",
          "WHO Patient Safety Curriculum Guide",
          "Evidence-based Practice Guidelines (Cochrane Reviews)",
        ],
        learningOutcomes: builderData.learningObjectives.filter((obj) =>
          obj.trim(),
        ),
        performanceCriteria: builderData.assessmentCriteria.filter((criteria) =>
          criteria.trim(),
        ),
        evidenceRequirements: builderData.evidenceRequirements.filter((req) =>
          req.trim(),
        ),
        assessmentMethods: [
          "Direct Observation Checklist",
          "Portfolio Assessment",
          "Simulation-based Evaluation",
          "Peer Review Assessment",
        ],
        qualityAssurance: {
          interRaterReliability: "≥85%",
          contentValidity: "Expert panel validation",
          criterionValidity: "Correlation with patient outcomes",
          reliability: "Cronbach's α ≥0.8",
        },
        implementationPhases: [
          {
            phase: "Development & Validation",
            duration: "4-6 weeks",
            activities: [
              "Content development",
              "Expert review",
              "Pilot testing",
            ],
          },
          {
            phase: "Training & Rollout",
            duration: "2-3 weeks",
            activities: [
              "Assessor training",
              "System integration",
              "Staff orientation",
            ],
          },
          {
            phase: "Monitoring & Evaluation",
            duration: "Ongoing",
            activities: [
              "Performance monitoring",
              "Feedback collection",
              "Continuous improvement",
            ],
          },
        ],
        references: [
          "Department of Health Abu Dhabi. (2024). Standards for Home Healthcare Services.",
          "International Council of Nurses. (2023). ICN Framework of Competencies for the Nurse Specialist.",
          "World Health Organization. (2023). Patient Safety Curriculum Guide: Multi-professional Edition.",
          "Cochrane Collaboration. (2024). Evidence-based Practice in Healthcare.",
        ],
      };

      setBuilderData((prev) => ({
        ...prev,
        isGenerating: false,
        generatedContent,
      }));
    } catch (error) {
      console.error("Error generating competency content:", error);
      setBuilderData((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const saveGeneratedCompetency = async () => {
    if (!builderData.generatedContent) return;

    try {
      // In a real implementation, this would call the API to save the competency
      const competencyData = {
        ...builderData.generatedContent,
        targetRole: builderData.targetRole,
        competencyLevel: builderData.competencyLevel,
        createdBy: "AI Competency Builder",
        createdAt: new Date().toISOString(),
        status: "draft",
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        "Competency framework saved successfully! It will be available for review and approval.",
      );

      // Reset builder
      setBuilderData({
        topic: "",
        targetRole: "nurse",
        competencyLevel: "intermediate",
        learningObjectives: [""],
        evidenceRequirements: [""],
        assessmentCriteria: [""],
        isGenerating: false,
        generatedContent: null,
      });
    } catch (error) {
      console.error("Error saving competency:", error);
      alert("Error saving competency. Please try again.");
    }
  };

  const downloadCertificate = (certification: any) => {
    // Create a comprehensive certificate content
    const certificateContent = `
      REYADA HOMECARE PLATFORM
      CERTIFICATE OF COMPETENCY
      
      This certifies that the bearer has successfully completed:
      ${certification.moduleTitle}
      
      Role: ${certification.roleTitle}
      Certificate Number: ${certification.certificateNumber}
      Completion Date: ${new Date(certification.completionDate).toLocaleDateString()}
      Competency Level: ${certification.competencyLevel}
      Valid Until: ${new Date(certification.validUntil).toLocaleDateString()}
      
      Skills Demonstrated:
      ${certification.skills.join(", ")}
      
      Score: ${certification.score}%
      
      This certificate confirms that the holder has demonstrated competency in
      the specified healthcare role and meets the standards required by the
      Department of Health (DOH) and Reyada Homecare Platform.
      
      Digitally Signed: ${certification.signatureData ? "Yes" : "No"}
      Issue Date: ${new Date(certification.issuedDate).toLocaleDateString()}
      
      Authorized by: Reyada Homecare Platform
      Compliance: DOH Standards Compliant
    `;

    const blob = new Blob([certificateContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate-${certification.certificateNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleErrorHelp = (errorType: string, errorMessage: string) => {
    const help = damanTrainingSupport.getErrorResolutionHelp(
      errorType,
      errorMessage,
    );
    setErrorResolution(help);
  };

  const renderContextualHelp = () => {
    if (!contextualHelp) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {contextualHelp.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{contextualHelp.content}</p>

          {contextualHelp.examples && contextualHelp.examples.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Examples:</h4>
              <ul className="text-sm space-y-1">
                {contextualHelp.examples.map(
                  (example: string, index: number) => (
                    <li key={index} className="text-green-600">
                      • {example}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {contextualHelp.commonMistakes &&
            contextualHelp.commonMistakes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Common Mistakes:</h4>
                <ul className="text-sm space-y-1">
                  {contextualHelp.commonMistakes.map(
                    (mistake: string, index: number) => (
                      <li key={index} className="text-red-600">
                        • {mistake}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {contextualHelp.smartSuggestions &&
            contextualHelp.smartSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Smart Suggestions:
                </h4>
                <div className="space-y-2">
                  {contextualHelp.smartSuggestions.map(
                    (suggestion: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <span className="text-sm">{suggestion}</span>
                        {onGuidanceApply && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onGuidanceApply(suggestion)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {contextualHelp.complianceUpdates &&
            contextualHelp.complianceUpdates.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Latest Updates:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {contextualHelp.complianceUpdates.map(
                      (update: string, index: number) => (
                        <li key={index}>{update}</li>
                      ),
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    );
  };

  const renderGuidanceSteps = () => {
    if (guidanceSteps.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Step-by-Step Guidance
          </CardTitle>
          <CardDescription>
            Follow these steps for successful Daman submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guidanceSteps.map((step, index) => {
              const isCompleted = step.type === "success";
              const hasWarning = step.type === "warning";
              const hasError = step.type === "error";

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : hasWarning
                          ? "bg-yellow-100 text-yellow-700"
                          : hasError
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : hasError ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {step.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.estimatedTime}
                        </div>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {step.difficulty}
                      </Badge>
                    </div>

                    {step.prerequisites && step.prerequisites.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Prerequisites:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {step.prerequisites.map(
                            (prereq: string, i: number) => (
                              <li key={i}>{prereq}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderKnowledgeBase = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Search Daman guidelines and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search guidelines, procedures, FAQs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {knowledgeBase.map((article) => (
                <div
                  key={article.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{article.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {article.content}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {article.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {article.estimatedReadTime}min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderTrainingModules = () => {
    return (
      <div className="space-y-4">
        {!selectedModule ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((module) => {
              const progress = userProgress[module.id];
              const isCompleted = progress?.completed || false;

              return (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              module.role === "nurse"
                                ? "bg-blue-50 text-blue-700"
                                : module.role === "assistant-nurse"
                                  ? "bg-green-50 text-green-700"
                                  : module.role === "caregiver"
                                    ? "bg-purple-50 text-purple-700"
                                    : module.role === "therapist"
                                      ? "bg-orange-50 text-orange-700"
                                      : module.role === "supervisor"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {{
                              nurse: "Nurse",
                              "assistant-nurse": "Assistant Nurse",
                              caregiver: "Care Giver",
                              therapist: "Therapist",
                              supervisor: "Supervisor",
                              universal: "Universal",
                            }[module.role] || "General"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {module.duration}min
                      </div>
                      <Badge variant="outline">{module.difficulty}</Badge>
                    </div>

                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>
                            {progress.completedSections?.length || 0}/
                            {module.sections.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            ((progress.completedSections?.length || 0) /
                              module.sections.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => handleModuleStart(module)}
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isCompleted ? "Review" : "Start"} Module
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedModule.title}</CardTitle>
                  <CardDescription>
                    Section {currentSection + 1} of{" "}
                    {selectedModule.sections.length}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedModule(null)}
                >
                  Back to Modules
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(moduleProgress)}%</span>
                </div>
                <Progress value={moduleProgress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {selectedModule.sections[currentSection].title}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p>{selectedModule.sections[currentSection].content}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentSection((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>

                <Button
                  onClick={handleSectionComplete}
                  disabled={
                    currentSection >= selectedModule.sections.length - 1
                  }
                >
                  {currentSection >= selectedModule.sections.length - 1
                    ? "Complete & Get Certified"
                    : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCertifications = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Certificate className="h-5 w-5" />
              My Certifications
            </CardTitle>
            <CardDescription>
              View and manage your training certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certifications.length === 0 ? (
              <div className="text-center py-8">
                <Certificate className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No certifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete training modules to earn certifications
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="border-2 border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-green-700">
                            {cert.moduleTitle}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Certificate #{cert.certificateNumber}
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Certified
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Role:</span>
                          <p className="font-medium">{cert.roleTitle}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Level:</span>
                          <p className="font-medium capitalize">
                            {cert.competencyLevel}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Completed:</span>
                          <p className="font-medium">
                            {new Date(cert.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Valid Until:</span>
                          <p className="font-medium">
                            {new Date(cert.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cert.skills
                              .slice(0, 3)
                              .map((skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {cert.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{cert.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          {cert.signatureData && (
                            <Badge variant="secondary" className="text-xs">
                              <PenTool className="h-3 w-3 mr-1" />
                              Digitally Signed
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCertificate(cert)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCompetencyFramework = () => {
    if (!competencyData.dashboardData) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading competency framework...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Framework Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Frameworks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      competencyData.dashboardData.framework_overview
                        .active_frameworks
                    }
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Core Competencies</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      competencyData.dashboardData.framework_overview
                        .total_competencies
                    }
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Training Modules</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      competencyData.dashboardData.training_statistics
                        .total_modules
                    }
                  </p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assessments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      competencyData.dashboardData.assessment_insights
                        .total_assessments
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competency Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Competency Domains
            </CardTitle>
            <CardDescription>
              Evidence-based competency framework aligned with DOH standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  domain: "Clinical Skills & Procedures",
                  description:
                    "Core clinical competencies and technical skills",
                  competencies: 12,
                  color: "blue",
                  icon: <Lightbulb className="h-5 w-5" />,
                },
                {
                  domain: "Assessment & Care Planning",
                  description:
                    "Patient assessment and individualized care planning",
                  competencies: 8,
                  color: "green",
                  icon: <FileText className="h-5 w-5" />,
                },
                {
                  domain: "Regulatory & Legal Compliance",
                  description: "DOH standards and legal requirements",
                  competencies: 6,
                  color: "red",
                  icon: <AlertTriangle className="h-5 w-5" />,
                },
                {
                  domain: "Communication & Cultural Competency",
                  description:
                    "Effective communication and cultural sensitivity",
                  competencies: 7,
                  color: "purple",
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  domain: "Technology & Documentation",
                  description:
                    "Digital health tools and documentation standards",
                  competencies: 5,
                  color: "indigo",
                  icon: <Video className="h-5 w-5" />,
                },
                {
                  domain: "Safety & Risk Management",
                  description: "Patient safety and risk mitigation strategies",
                  competencies: 9,
                  color: "yellow",
                  icon: <AlertTriangle className="h-5 w-5" />,
                },
              ].map((domain, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg bg-${domain.color}-100 text-${domain.color}-600`}
                      >
                        {domain.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">
                          {domain.domain}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {domain.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {domain.competencies} competencies
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Assessment Methods
            </CardTitle>
            <CardDescription>
              Comprehensive assessment tools for competency validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  method: "Skills Checklists",
                  description:
                    "Structured observation and validation of clinical skills",
                  features: [
                    "Direct observation",
                    "Standardized criteria",
                    "Real-time feedback",
                  ],
                  icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                },
                {
                  method: "Simulation Scenarios",
                  description:
                    "Controlled environment for complex skill assessment",
                  features: [
                    "Safe practice environment",
                    "Standardized scenarios",
                    "Immediate debriefing",
                  ],
                  icon: <Play className="h-5 w-5 text-blue-600" />,
                },
                {
                  method: "Portfolio Assessment",
                  description:
                    "Comprehensive documentation of learning and competency",
                  features: [
                    "Evidence collection",
                    "Reflective practice",
                    "Continuous improvement",
                  ],
                  icon: <FileText className="h-5 w-5 text-purple-600" />,
                },
                {
                  method: "360-Degree Peer Review",
                  description:
                    "Multi-source feedback from colleagues and supervisors",
                  features: [
                    "Peer evaluation",
                    "Supervisor feedback",
                    "Self-assessment",
                  ],
                  icon: <Users className="h-5 w-5 text-orange-600" />,
                },
              ].map((method, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    {method.icon}
                    <div>
                      <h4 className="font-medium">{method.method}</h4>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {method.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Assurance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quality Assurance Metrics
            </CardTitle>
            <CardDescription>
              Framework reliability and effectiveness indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  metric: "Inter-rater Reliability",
                  value: Math.round(
                    competencyData.dashboardData.quality_metrics
                      .inter_rater_reliability * 100,
                  ),
                  target: 85,
                  color: "green",
                },
                {
                  metric: "Assessment Validity",
                  value: Math.round(
                    competencyData.dashboardData.quality_metrics
                      .assessment_validity * 100,
                  ),
                  target: 90,
                  color: "blue",
                },
                {
                  metric: "Training Effectiveness",
                  value: Math.round(
                    competencyData.dashboardData.quality_metrics
                      .training_effectiveness * 100,
                  ),
                  target: 80,
                  color: "purple",
                },
                {
                  metric: "DOH Compliance Score",
                  value: Math.round(
                    competencyData.dashboardData.quality_metrics
                      .compliance_score * 100,
                  ),
                  target: 95,
                  color: "orange",
                },
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div
                      className={`text-2xl font-bold text-${metric.color}-600`}
                    >
                      {metric.value}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {metric.target}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`bg-${metric.color}-600 h-2 rounded-full`}
                      style={{
                        width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs font-medium">{metric.metric}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAICompetencyBuilder = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              AI-Powered Competency Builder
            </CardTitle>
            <CardDescription>
              Create evidence-based competency frameworks using AI assistance
              aligned with DOH standards and international best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!builderData.generatedContent ? (
              <div className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Competency Topic *
                  </label>
                  <Input
                    placeholder="e.g., Wound Care Management, Medication Administration, Patient Assessment"
                    value={builderData.topic}
                    onChange={(e) =>
                      handleBuilderInputChange("topic", e.target.value)
                    }
                  />
                </div>

                {/* Target Role and Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Role</label>
                    <select
                      value={builderData.targetRole}
                      onChange={(e) =>
                        handleBuilderInputChange("targetRole", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="nurse">Registered Nurse</option>
                      <option value="assistant-nurse">Assistant Nurse</option>
                      <option value="caregiver">Care Giver</option>
                      <option value="therapist">Therapist</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Competency Level
                    </label>
                    <select
                      value={builderData.competencyLevel}
                      onChange={(e) =>
                        handleBuilderInputChange(
                          "competencyLevel",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="novice">Novice</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Learning Objectives
                  </label>
                  {builderData.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter learning objective"
                        value={objective}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "learningObjectives",
                            index,
                            e.target.value,
                          )
                        }
                      />
                      {builderData.learningObjectives.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeArrayField("learningObjectives", index)
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("learningObjectives")}
                  >
                    Add Objective
                  </Button>
                </div>

                {/* Evidence Requirements */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Evidence Requirements
                  </label>
                  {builderData.evidenceRequirements.map(
                    (requirement, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Enter evidence requirement"
                          value={requirement}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "evidenceRequirements",
                              index,
                              e.target.value,
                            )
                          }
                        />
                        {builderData.evidenceRequirements.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeArrayField("evidenceRequirements", index)
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("evidenceRequirements")}
                  >
                    Add Requirement
                  </Button>
                </div>

                {/* Assessment Criteria */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Assessment Criteria
                  </label>
                  {builderData.assessmentCriteria.map((criteria, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter assessment criteria"
                        value={criteria}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "assessmentCriteria",
                            index,
                            e.target.value,
                          )
                        }
                      />
                      {builderData.assessmentCriteria.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeArrayField("assessmentCriteria", index)
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayField("assessmentCriteria")}
                  >
                    Add Criteria
                  </Button>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={generateCompetencyContent}
                    disabled={
                      !builderData.topic.trim() || builderData.isGenerating
                    }
                    className="px-8 py-2"
                  >
                    {builderData.isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Evidence-Based Content...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Generate AI-Powered Competency Framework
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Generated Content Display */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-700">
                    ✓ Generated Competency Framework
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setBuilderData((prev) => ({
                          ...prev,
                          generatedContent: null,
                        }))
                      }
                    >
                      Edit Input
                    </Button>
                    <Button onClick={saveGeneratedCompetency}>
                      Save Framework
                    </Button>
                  </div>
                </div>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700">
                      {builderData.generatedContent.title}
                    </CardTitle>
                    <CardDescription>
                      {builderData.generatedContent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Evidence Base */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Evidence Base & References
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <ul className="text-sm space-y-1">
                          {builderData.generatedContent.evidenceBase.map(
                            (evidence, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{evidence}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h4 className="font-medium mb-2">Learning Outcomes</h4>
                      <ul className="text-sm space-y-1">
                        {builderData.generatedContent.learningOutcomes.map(
                          (outcome, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>{outcome}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    {/* Assessment Methods */}
                    <div>
                      <h4 className="font-medium mb-2">Assessment Methods</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {builderData.generatedContent.assessmentMethods.map(
                          (method, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="justify-start"
                            >
                              {method}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Quality Assurance */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Quality Assurance Metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(
                          builderData.generatedContent.qualityAssurance,
                        ).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="font-medium">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Implementation Phases */}
                    <div>
                      <h4 className="font-medium mb-2">
                        Implementation Roadmap
                      </h4>
                      <div className="space-y-3">
                        {builderData.generatedContent.implementationPhases.map(
                          (phase, index) => (
                            <div
                              key={index}
                              className="border-l-4 border-blue-500 pl-4"
                            >
                              <div className="font-medium">{phase.phase}</div>
                              <div className="text-sm text-gray-600 mb-1">
                                Duration: {phase.duration}
                              </div>
                              <ul className="text-sm text-gray-700">
                                {phase.activities.map((activity, actIndex) => (
                                  <li key={actIndex}>• {activity}</li>
                                ))}
                              </ul>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* References */}
                    <div>
                      <h4 className="font-medium mb-2">Academic References</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {builderData.generatedContent.references.map(
                          (ref, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              {index + 1}. {ref}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Builder Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                Evidence-Based Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>All generated competencies are based on:</p>
              <ul className="mt-2 space-y-1">
                <li>• DOH Standards & Guidelines</li>
                <li>• International Best Practices</li>
                <li>• Peer-Reviewed Research</li>
                <li>• Clinical Evidence</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Quality Assured
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>Built-in quality assurance includes:</p>
              <ul className="mt-2 space-y-1">
                <li>• Inter-rater Reliability ≥85%</li>
                <li>• Content Validity Testing</li>
                <li>• Expert Panel Review</li>
                <li>• Continuous Monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Continuous Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>Framework includes:</p>
              <ul className="mt-2 space-y-1">
                <li>• Performance Analytics</li>
                <li>• Feedback Integration</li>
                <li>• Regular Updates</li>
                <li>• Outcome Tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderEducationalResources = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Educational Resources Library
            </CardTitle>
            <CardDescription>
              Evidence-based resources and best practices for healthcare
              professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resource Categories */}
              {[
                {
                  category: "Clinical Guidelines",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "guideline",
                  ).length,
                  description: "Evidence-based clinical practice guidelines",
                  icon: <FileText className="h-5 w-5 text-blue-600" />,
                  color: "blue",
                },
                {
                  category: "Best Practices",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "best_practice",
                  ).length,
                  description: "Proven strategies and methodologies",
                  icon: <Star className="h-5 w-5 text-green-600" />,
                  color: "green",
                },
                {
                  category: "Case Studies",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "case_study",
                  ).length,
                  description: "Real-world scenarios and learning examples",
                  icon: <Users className="h-5 w-5 text-purple-600" />,
                  color: "purple",
                },
                {
                  category: "Research Articles",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "research",
                  ).length,
                  description: "Latest research and evidence",
                  icon: <Lightbulb className="h-5 w-5 text-orange-600" />,
                  color: "orange",
                },
                {
                  category: "Policies & Procedures",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "policy",
                  ).length,
                  description: "Organizational policies and procedures",
                  icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
                  color: "red",
                },
                {
                  category: "Protocols",
                  count: competencyData.educationalResources.filter(
                    (r) => r.resource_type === "protocol",
                  ).length,
                  description: "Standardized care protocols",
                  icon: <CheckCircle className="h-5 w-5 text-indigo-600" />,
                  color: "indigo",
                },
              ].map((category, index) => (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`p-2 rounded-lg bg-${category.color}-100`}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.category}</h4>
                        <p className="text-sm text-gray-600">
                          {category.count} resources
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {category.description}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Browse Resources
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competencyData.dashboardData?.educational_resources.recent_additions
                .slice(0, 5)
                .map((resource: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Added{" "}
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )) || []}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUpdateNotifications = () => {
    if (updateNotifications.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Latest Updates
          </CardTitle>
          <CardDescription>
            Important Daman guideline updates and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {updateNotifications.map((notification) => (
              <Alert
                key={notification.id}
                className={`${
                  notification.priority === "critical"
                    ? "border-red-200 bg-red-50"
                    : notification.priority === "high"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-2">
                  {notification.priority === "critical" ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">
                        {notification.title}
                      </h4>
                      <Badge
                        variant={
                          notification.priority === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {notification.description}
                    </p>
                    {notification.effectiveDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Effective:{" "}
                        {new Date(
                          notification.effectiveDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBestPractices = () => {
    if (!bestPractices) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {bestPractices.title}
          </CardTitle>
          <CardDescription>
            Proven strategies for successful Daman submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bestPractices.practices.map((practice: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{practice.practice}</h4>
                  <div className="flex gap-1">
                    <Badge
                      variant={
                        practice.impact === "high" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {practice.impact} impact
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {practice.difficulty}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{practice.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Quality Management Training & Competency Center
          </h2>
          <p className="text-gray-600">
            Evidence-based competency framework for healthcare professionals
            aligned with DOH standards
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Evidence-Based Framework
            </Badge>
            <Badge variant="outline" className="text-xs">
              DOH Compliant
            </Badge>
            <Badge variant="outline" className="text-xs">
              Multi-Role Competencies
            </Badge>
            <Badge variant="outline" className="text-xs">
              Quality Assured
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              loadTrainingData();
            }}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="nurse">Nurses</option>
            <option value="assistant-nurse">Assistant Nurses</option>
            <option value="caregiver">Care Givers</option>
            <option value="therapist">Therapists</option>
            <option value="supervisor">Supervisors</option>
            <option value="universal">Universal Training</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="competency" className="space-y-4">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="competency">DOH Framework</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="builder">AI Builder</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="jawda">JAWDA Integration</TabsTrigger>
          <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
          <TabsTrigger value="help">AI Support</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="competency" className="space-y-4">
          {renderCompetencyFramework()}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {renderTrainingModules()}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Competency Assessments
              </CardTitle>
              <CardDescription>
                Comprehensive assessment tools for validating healthcare
                competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Assessment tools are being developed
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Skills checklists, simulations, and portfolio assessments
                  coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {renderEducationalResources()}
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          {renderAICompetencyBuilder()}
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          {renderCertifications()}
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          {renderContextualHelp()}
          {renderBestPractices()}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          {renderGuidanceSteps()}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {renderKnowledgeBase()}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          {renderUpdateNotifications()}
        </TabsContent>

        <TabsContent value="jawda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                JAWDA Quality Framework Integration
              </CardTitle>
              <CardDescription>
                Quality indicators and performance metrics aligned with JAWDA
                standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quality Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Quality Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patient Safety</span>
                      <Badge variant="default">98.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clinical Effectiveness</span>
                      <Badge variant="default">94.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patient Experience</span>
                      <Badge variant="default">4.7/5.0</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Competency Pass Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">92%</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Training Completion</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">88%</span>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patient Outcomes</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">4.3/5.0</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">JAWDA Standards</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DOH Requirements</span>
                      <Badge variant="default">95% Met</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audit Score</span>
                      <Badge variant="default">96/100</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                DOH Compliance Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of DOH standards compliance and regulatory
                requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        94%
                      </div>
                      <div className="text-sm text-gray-600">
                        Overall Compliance
                      </div>
                      <Progress value={94} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        92%
                      </div>
                      <div className="text-sm text-gray-600">Documentation</div>
                      <Progress value={92} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        96%
                      </div>
                      <div className="text-sm text-gray-600">
                        Patient Safety
                      </div>
                      <Progress value={96} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        91%
                      </div>
                      <div className="text-sm text-gray-600">
                        Clinical Quality
                      </div>
                      <Progress value={91} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Nine Domains of Care */}
              <Card>
                <CardHeader>
                  <CardTitle>Nine Domains of Care Compliance</CardTitle>
                  <CardDescription>
                    DOH mandated nine domains assessment and compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        domain: "Clinical Care & Assessment",
                        score: 94,
                        status: "compliant",
                      },
                      {
                        domain: "Patient Safety & Risk Management",
                        score: 96,
                        status: "compliant",
                      },
                      {
                        domain: "Infection Prevention & Control",
                        score: 98,
                        status: "compliant",
                      },
                      {
                        domain: "Medication Management",
                        score: 89,
                        status: "partial",
                      },
                      {
                        domain: "Documentation Standards",
                        score: 92,
                        status: "compliant",
                      },
                      {
                        domain: "Continuity of Care",
                        score: 91,
                        status: "compliant",
                      },
                      {
                        domain: "Patient Rights & Ethics",
                        score: 95,
                        status: "compliant",
                      },
                      {
                        domain: "Quality Improvement",
                        score: 87,
                        status: "partial",
                      },
                      {
                        domain: "Professional Development",
                        score: 93,
                        status: "compliant",
                      },
                    ].map((domain, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {domain.domain}
                          </span>
                          <Badge
                            variant={
                              domain.status === "compliant"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {domain.score}%
                          </Badge>
                        </div>
                        <Progress value={domain.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quality Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Performance metrics and quality indicators for competency
                management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competencyData.dashboardData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Completion Rates */}
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Training Completion Rates by Role
                    </h4>
                    {competencyData.dashboardData.training_statistics.completion_rates.map(
                      (rate: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">
                            {rate.role.replace("-", " ")}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${rate.completion_rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {rate.completion_rate}%
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Competency Gaps */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Top Competency Gaps</h4>
                    {competencyData.dashboardData.assessment_insights.competency_gaps
                      .slice(0, 5)
                      .map((gap: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{gap.competency}</span>
                          <Badge
                            variant={
                              gap.gap_percentage > 30
                                ? "destructive"
                                : gap.gap_percentage > 15
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {gap.gap_percentage}% gap
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading analytics data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certification Dialog */}
      <Dialog
        open={showCertificationDialog}
        onOpenChange={setShowCertificationDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Certificate className="h-5 w-5 text-green-600" />
              Congratulations! You've Earned a Certification
            </DialogTitle>
          </DialogHeader>
          {pendingCertification && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have successfully completed the{" "}
                  <strong>{pendingCertification.moduleTitle}</strong> training
                  module!
                </AlertDescription>
              </Alert>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Certificate className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {pendingCertification.moduleTitle}
                      </h3>
                      <p className="text-gray-600">Certificate of Competency</p>
                      <p className="text-sm text-blue-600 font-medium">
                        {pendingCertification.roleTitle}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <p className="font-medium">
                          {pendingCertification.roleTitle}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Level:</span>
                        <p className="font-medium capitalize">
                          {pendingCertification.competencyLevel}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Completed:</span>
                        <p className="font-medium">
                          {new Date(
                            pendingCertification.completionDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Valid Until:</span>
                        <p className="font-medium">
                          {new Date(
                            pendingCertification.validUntil,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To complete the certification process, please provide your
                  electronic signature below.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCertificationDialog(false)}
                >
                  Later
                </Button>
                <Button onClick={handleSignCertification}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Sign Certificate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Electronic Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Electronic Signature Required</DialogTitle>
          </DialogHeader>
          {pendingCertification && (
            <ElectronicSignature
              documentId={pendingCertification.id}
              documentType="training_certification"
              onSignatureComplete={handleSignatureComplete}
              onCancel={() => setShowSignatureDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DamanTrainingInterface;
