import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  FileText,
  Zap,
  Brain,
  Shield,
  Smartphone,
  Globe,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function EnhancedFormGenerationEngineStoryboard() {
  const [activeDemo, setActiveDemo] = useState("overview");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForms, setGeneratedForms] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGeneratedForms((prev) => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateForm = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      { name: "Analyzing Context", duration: 500 },
      { name: "Loading Templates", duration: 300 },
      { name: "Applying AI Enhancements", duration: 800 },
      { name: "Generating HTML/CSS", duration: 600 },
      { name: "Validating Compliance", duration: 400 },
      { name: "Finalizing Form", duration: 300 },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    setIsGenerating(false);
    setGeneratedForms((prev) => prev + 1);
  };

  const engineStats = {
    totalTemplates: 15,
    activeTemplates: 12,
    generatedForms: generatedForms + 1247,
    completedForms: generatedForms + 1089,
    averageGenerationTime: "2.3s",
    complianceRate: 98.7,
    aiOptimizationScore: 94.2,
  };

  const formTemplates = [
    {
      id: "patient_intake",
      name: "Patient Intake Form",
      category: "patient",
      fields: 12,
      compliance: ["DOH", "JAWDA"],
      aiEnhanced: true,
    },
    {
      id: "doh_9_domain",
      name: "DOH 9-Domain Assessment",
      category: "clinical",
      fields: 18,
      compliance: ["DOH", "JAWDA"],
      aiEnhanced: true,
    },
    {
      id: "safety_incident",
      name: "Patient Safety Incident Report",
      category: "clinical",
      fields: 8,
      compliance: ["DOH"],
      aiEnhanced: true,
    },
    {
      id: "medication_reconciliation",
      name: "Medication Reconciliation",
      category: "clinical",
      fields: 15,
      compliance: ["DOH"],
      aiEnhanced: true,
    },
  ];

  const aiFeatures = [
    {
      name: "Intelligent Defaults",
      description: "AI-powered field pre-population based on patient context",
      icon: Brain,
      active: true,
    },
    {
      name: "Predictive Fields",
      description: "Dynamic field suggestions based on assessment type",
      icon: Zap,
      active: true,
    },
    {
      name: "Compliance Validation",
      description: "Real-time DOH and JAWDA compliance checking",
      icon: Shield,
      active: true,
    },
    {
      name: "Contextual Help",
      description: "Smart help text and clinical guidance",
      icon: AlertTriangle,
      active: true,
    },
    {
      name: "Mobile Optimization",
      description: "Responsive design with touch-friendly interfaces",
      icon: Smartphone,
      active: true,
    },
    {
      name: "Multi-language Support",
      description: "Arabic and English form generation",
      icon: Globe,
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <FileText className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced Form Generation Engine
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered dynamic form generation with healthcare compliance,
            intelligent validation, and real-time optimization
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engineStats.totalTemplates}
              </div>
              <div className="text-sm text-gray-600">Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {engineStats.generatedForms.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Generated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {engineStats.completedForms.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {engineStats.averageGenerationTime}
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {engineStats.complianceRate}%
              </div>
              <div className="text-sm text-gray-600">Compliance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {engineStats.aiOptimizationScore}%
              </div>
              <div className="text-sm text-gray-600">AI Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {engineStats.activeTemplates}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeDemo}
          onValueChange={setActiveDemo}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="ai-features">AI Features</TabsTrigger>
            <TabsTrigger value="generation">Live Demo</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Engine Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Initialization Status</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Initialized
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Template System</span>
                    <Badge
                      variant="default"
                      className="bg-blue-100 text-blue-800"
                    >
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI Enhancements</span>
                    <Badge
                      variant="default"
                      className="bg-purple-100 text-purple-800"
                    >
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Validation</span>
                    <Badge
                      variant="default"
                      className="bg-orange-100 text-orange-800"
                    >
                      DOH + JAWDA
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generation Speed</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliance Rate</span>
                      <span>98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Optimization</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User Satisfaction</span>
                      <span>96.8%</span>
                    </div>
                    <Progress value={96.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Form Generation Engine is fully operational with all AI
                enhancements active. Healthcare compliance validation is enabled
                for DOH and JAWDA standards.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      {template.aiEnhanced && (
                        <Badge variant="secondary">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Enhanced
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fields</span>
                      <span className="font-medium">{template.fields}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compliance</span>
                      <div className="flex space-x-1">
                        {template.compliance.map((comp) => (
                          <Badge
                            key={comp}
                            variant="default"
                            className="text-xs"
                          >
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      Generate Form
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={feature.name}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{feature.name}</h3>
                            <Badge
                              variant={feature.active ? "default" : "secondary"}
                              className={
                                feature.active
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {feature.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Form Generation Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Button
                    onClick={handleGenerateForm}
                    disabled={isGenerating}
                    size="lg"
                    className="px-8"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Generating Form...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate DOH Assessment Form
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="h-3" />
                      <p className="text-sm text-gray-600">
                        {generationProgress < 20
                          ? "Analyzing clinical context..."
                          : generationProgress < 40
                            ? "Loading healthcare templates..."
                            : generationProgress < 70
                              ? "Applying AI enhancements..."
                              : generationProgress < 90
                                ? "Generating form structure..."
                                : "Finalizing compliance validation..."}
                      </p>
                    </div>
                  )}
                </div>

                {!isGenerating && generationProgress === 100 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Form generated successfully! DOH 9-Domain Assessment form
                      with AI enhancements and compliance validation is ready.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>DOH Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>9-Domain Assessment</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Patient Safety Taxonomy</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Clinical Documentation</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Compliant
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Electronic Signatures</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Compliant
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>JAWDA Quality Standards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Quality Indicators</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Implemented
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance Metrics</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Tracked
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Continuous Improvement</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Certification</span>
                      <Badge className="bg-green-100 text-green-800">
                        ✓ V2025
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
