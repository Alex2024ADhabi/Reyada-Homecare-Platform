import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  Settings,
  Shield,
  Database,
  Sparkles,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Stethoscope,
  FileText,
  Workflow,
  PieChart,
} from 'lucide-react';
import { aiHubService } from '@/services/ai-hub.service';
import { revenueIntelligenceService } from '@/services/revenue-intelligence.service';
import { clinicalDecisionSupportService } from '@/services/clinical-decision-support.service';
import { workflowIntelligenceService } from '@/services/workflow-intelligence.service';

interface ComprehensiveAIHubProps {
  className?: string;
}

interface AIHubData {
  overview: {
    totalAIRequests: number;
    successRate: number;
    averageResponseTime: number;
    modelAccuracy: number;
  };
  services: any[];
  insights: any[];
  performance: any;
  recommendations: string[];
}

export const ComprehensiveAIHub: React.FC<ComprehensiveAIHubProps> = ({
  className = '',
}) => {
  const [aiHubData, setAIHubData] = useState<AIHubData | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [clinicalData, setClinicalData] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAllAIData();
  }, []);

  const loadAllAIData = async () => {
    try {
      setIsLoading(true);
      
      const [aiData, revenueAnalysis, clinicalSupport, workflowAnalysis] = await Promise.all([
        aiHubService.getAnalyticsDashboardData(),
        revenueIntelligenceService.analyzeRevenueOptimization(),
        clinicalDecisionSupportService.generateClinicalRecommendations('patient-001', {
          demographics: { age: 65, gender: 'male' },
          conditions: ['hypertension', 'diabetes'],
          medications: [],
          vitalSigns: [],
          labResults: [],
          assessments: [],
        }),
        workflowIntelligenceService.analyzeWorkflowEfficiency('patient_admission'),
      ]);
      
      setAIHubData(aiData);
      setRevenueData(revenueAnalysis);
      setClinicalData(clinicalSupport);
      setWorkflowData(workflowAnalysis);
    } catch (error) {
      console.error('Failed to load AI Hub data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runComprehensiveAnalysis = async () => {
    setIsProcessing(true);
    try {
      const analysis = await aiHubService.performComprehensiveHealthcareAnalysis(
        'patient-001',
        'episode-001',
        {
          includePredictiveModeling: true,
          includeRiskAssessment: true,
          includeQualityMetrics: true,
          includeComplianceCheck: true,
          realTimeMonitoring: true,
        }
      );
      console.log('Comprehensive analysis completed:', analysis);
      await loadAllAIData(); // Refresh data
    } catch (error) {
      console.error('Failed to run comprehensive analysis:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !aiHubData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Brain className="h-16 w-16 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-xl font-medium">Initializing AI Hub...</p>
          <p className="text-gray-600">Loading comprehensive AI analytics platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-10 w-10 text-blue-600" />
            Comprehensive AI Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered healthcare analytics and decision support platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Enhanced
          </Badge>
          <Button onClick={runComprehensiveAnalysis} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Analysis
          </Button>
          <Button onClick={loadAllAIData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              AI Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {aiHubData.overview.totalAIRequests.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">Total processed today</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {aiHubData.overview.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">AI operations</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {aiHubData.overview.averageResponseTime}ms
            </div>
            <p className="text-xs text-purple-600 mt-1">Average latency</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {(aiHubData.overview.modelAccuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-orange-600 mt-1">ML models</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Intelligence */}
        {revenueData && (
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Revenue Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${revenueData.claimsOptimization.potentialRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Potential Revenue</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Collection Rate:</span>
                    <span className="font-medium">{revenueData.performanceMetrics.collectionRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Denial Rate:</span>
                    <span className="font-medium">{revenueData.performanceMetrics.denialRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Days in A/R:</span>
                    <span className="font-medium">{revenueData.performanceMetrics.daysInAR}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical Decision Support */}
        {clinicalData && (
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-red-600" />
                Clinical Decision Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {clinicalData.clinicalRecommendations.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Recommendations</div>
                </div>
                <div className="space-y-2">
                  {clinicalData.clinicalRecommendations.slice(0, 3).map((rec: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge 
                        className={
                          rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {rec.priority}
                      </Badge>
                      <span className="text-sm truncate">{rec.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Intelligence */}
        {workflowData && (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-6 w-6 text-purple-600" />
                Workflow Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {workflowData.optimizedEfficiency}%
                  </div>
                  <div className="text-sm text-gray-600">Optimized Efficiency</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span className="font-medium">{workflowData.currentEfficiency}%</span>
                  </div>
                  <Progress value={workflowData.currentEfficiency} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Potential Gain:</span>
                    <span className="font-medium text-green-600">
                      +{workflowData.optimizedEfficiency - workflowData.currentEfficiency}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="clinical">Clinical AI</TabsTrigger>
          <TabsTrigger value="revenue">Revenue AI</TabsTrigger>
          <TabsTrigger value="workflow">Workflow AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Service Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiHubData.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {service.status}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          {(service.performance.accuracy * 100).toFixed(1)}% accuracy
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Utilization</span>
                      <span>{aiHubData.performance.systemHealth.cpuUtilization}%</span>
                    </div>
                    <Progress value={aiHubData.performance.systemHealth.cpuUtilization} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{aiHubData.performance.systemHealth.memoryUsage}%</span>
                    </div>
                    <Progress value={aiHubData.performance.systemHealth.memoryUsage} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Model Performance</span>
                      <span>{(aiHubData.performance.modelPerformance.averageAccuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={aiHubData.performance.modelPerformance.averageAccuracy * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiHubData.services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {service.name}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {service.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy:</span>
                      <span className="font-medium">{(service.performance.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time:</span>
                      <span className="font-medium">{service.performance.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Throughput:</span>
                      <span className="font-medium">{service.performance.throughput}/min</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Capabilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {service.capabilities.map((cap: string, capIndex: number) => (
                          <Badge key={capIndex} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {aiHubData.insights.map((insight, index) => (
              <Alert key={index} className="border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {insight.type === 'forecast' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                    {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-green-600" />}
                    {insight.type === 'trend' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-blue-800">{insight.title}</strong>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            insight.impact === 'critical' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-blue-700 mb-2">{insight.description}</p>
                      {insight.recommendations && (
                        <div className="mt-2">
                          <strong className="text-sm">Recommendations:</strong>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {insight.recommendations.map((rec: string, recIndex: number) => (
                              <li key={recIndex}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          {clinicalData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinicalData.clinicalRecommendations.map((rec: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.recommendation}</h4>
                          <Badge className={`${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                        <div className="text-xs text-gray-500">
                          Evidence Level: {rec.evidence.level} | Confidence: {(rec.evidence.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clinicalData.riskAlerts.map((alert: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{alert.riskType}</div>
                          <div className="text-sm text-gray-600">
                            {(alert.probability * 100).toFixed(0)}% probability in {alert.timeframe}
                          </div>
                        </div>
                        <Badge className={`${
                          alert.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.riskLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {revenueData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.claimsOptimization.optimizationOpportunities.map((opp: any, index: number) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{opp.category}</h4>
                            <span className="text-green-600 font-bold">
                              ${opp.impact.toLocaleString()}
                            </span>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {opp.recommendations.map((rec: string, recIndex: number) => (
                              <li key={recIndex}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Collection Rate</span>
                        <span className="font-bold">{revenueData.performanceMetrics.collectionRate}%</span>
                      </div>
                      <Progress value={revenueData.performanceMetrics.collectionRate} />
                      
                      <div className="flex justify-between items-center">
                        <span>Days in A/R</span>
                        <span className="font-bold">{revenueData.performanceMetrics.daysInAR}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Denial Rate</span>
                        <span className="font-bold">{revenueData.performanceMetrics.denialRate}%</span>
                      </div>
                      <Progress value={100 - revenueData.performanceMetrics.denialRate} className="[&>div]:bg-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          {workflowData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Current vs Optimized Efficiency</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current</span>
                            <span>{workflowData.currentEfficiency}%</span>
                          </div>
                          <Progress value={workflowData.currentEfficiency} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Optimized</span>
                            <span>{workflowData.optimizedEfficiency}%</span>
                          </div>
                          <Progress value={workflowData.optimizedEfficiency} className="[&>div]:bg-green-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Bottlenec