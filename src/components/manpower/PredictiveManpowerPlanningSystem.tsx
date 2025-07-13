import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Brain, 
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';

export default function PredictiveManpowerPlanningSystem() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [planningResults, setPlanningResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const staffCategories = [
    {
      id: 1,
      category: 'Registered Nurses',
      current: 45,
      predicted: 58,
      demand: 'High',
      shortage: 13,
      efficiency: 87,
      workload: 'Optimal',
      skills: ['Clinical Assessment', 'Medication Management', 'Patient Education'],
      forecast: {
        week1: 52,
        week2: 54,
        week3: 56,
        week4: 58
      },
      icon: Users,
      color: 'blue'
    },
    {
      id: 2,
      category: 'Physical Therapists',
      current: 28,
      predicted: 35,
      demand: 'Medium',
      shortage: 7,
      efficiency: 92,
      workload: 'High',
      skills: ['Rehabilitation', 'Mobility Assessment', 'Exercise Planning'],
      forecast: {
        week1: 31,
        week2: 33,
        week3: 34,
        week4: 35
      },
      icon: Activity,
      color: 'green'
    },
    {
      id: 3,
      category: 'Home Health Aides',
      current: 67,
      predicted: 78,
      demand: 'High',
      shortage: 11,
      efficiency: 84,
      workload: 'Optimal',
      skills: ['Personal Care', 'Vital Signs', 'Basic Medical Support'],
      forecast: {
        week1: 72,
        week2: 75,
        week3: 76,
        week4: 78
      },
      icon: Target,
      color: 'purple'
    },
    {
      id: 4,
      category: 'Specialized Therapists',
      current: 22,
      predicted: 29,
      demand: 'Medium',
      shortage: 7,
      efficiency: 89,
      workload: 'High',
      skills: ['Speech Therapy', 'Occupational Therapy', 'Respiratory Care'],
      forecast: {
        week1: 25,
        week2: 27,
        week3: 28,
        week4: 29
      },
      icon: Brain,
      color: 'orange'
    }
  ];

  const demandFactors = [
    { factor: 'Seasonal Patient Increase', impact: '+15%', confidence: 94, timeframe: 'Next 4 weeks' },
    { factor: 'New Service Contracts', impact: '+22%', confidence: 89, timeframe: 'Next 8 weeks' },
    { factor: 'Staff Vacation Schedule', impact: '-8%', confidence: 96, timeframe: 'Next 6 weeks' },
    { factor: 'Training Program Graduates', impact: '+12%', confidence: 91, timeframe: 'Next 12 weeks' },
    { factor: 'Regulatory Compliance Requirements', impact: '+5%', confidence: 87, timeframe: 'Ongoing' },
    { factor: 'Technology Implementation', impact: '-3%', confidence: 85, timeframe: 'Next 16 weeks' }
  ];

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    const analysisSteps = [
      'Initializing Predictive Planning Engine...',
      'Analyzing Historical Staffing Data...',
      'Processing Patient Demand Patterns...',
      'Evaluating Seasonal Variations...',
      'Calculating Workload Distributions...',
      'Assessing Skill Requirements...',
      'Modeling Staff Availability...',
      'Predicting Future Demand...',
      'Optimizing Staff Allocation...',
      'Generating Planning Recommendations...'
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const results = {
      totalCurrentStaff: 162,
      predictedRequirement: 200,
      overallShortage: 38,
      efficiencyGain: 12.5,
      costOptimization: 18.7,
      patientSatisfactionImprovement: 15.3,
      optimalSchedulingAccuracy: 94.2,
      riskMitigation: 89.6,
      analysisTimestamp: new Date().toISOString()
    };

    setPlanningResults(results);
    setIsAnalyzing(false);
  };

  const getDemandColor = (demand: string) => {
    switch(demand) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkloadColor = (workload: string) => {
    switch(workload) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Optimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact.startsWith('+')) return 'text-green-600';
    if (impact.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const totalCurrentStaff = staffCategories.reduce((sum, category) => sum + category.current, 0);
  const totalPredictedStaff = staffCategories.reduce((sum, category) => sum + category.predicted, 0);
  const totalShortage = staffCategories.reduce((sum, category) => sum + category.shortage, 0);
  const averageEfficiency = staffCategories.reduce((sum, category) => sum + category.efficiency, 0) / staffCategories.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              PREDICTIVE MANPOWER
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">AI-Powered Workforce Planning</h2>
          <p className="text-lg text-gray-600">Advanced predictive analytics for optimal staff allocation</p>
          <div className="text-sm text-gray-500">
            Planning Engine: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* Current Status */}
        <Alert className="border-2 border-blue-200 bg-blue-50">
          <Users className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 text-lg">PREDICTIVE MANPOWER PLANNING - ACTIVE</AlertTitle>
          <AlertDescription className="mt-4 text-blue-700">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="mb-2"><strong>Current Staff:</strong> {totalCurrentStaff}</p>
                  <p className="mb-2"><strong>Predicted Need:</strong> {totalPredictedStaff}</p>
                  <p><strong>Shortage:</strong> {totalShortage} positions</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Efficiency:</strong> {averageEfficiency.toFixed(1)}%</p>
                  <p className="mb-2"><strong>Categories:</strong> 4 Analyzed</p>
                  <p><strong>Forecast Horizon:</strong> 4 weeks</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Demand Factors:</strong> 6 Active</p>
                  <p className="mb-2"><strong>Optimization:</strong> 18.7% cost savings</p>
                  <p><strong>Accuracy:</strong> 94.2%</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Model Status:</strong> Operational</p>
                  <p className="mb-2"><strong>Update Frequency:</strong> Real-time</p>
                  <p><strong>Risk Assessment:</strong> Active</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Planning Controls */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Zap className="h-6 w-6" />
              <span>Predictive Analysis Engine</span>
            </CardTitle>
            <CardDescription>Run comprehensive manpower planning analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button 
                size="lg" 
                onClick={runPredictiveAnalysis}
                disabled={isAnalyzing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Predictive Analysis
                  </>
                )}
              </Button>
              
              {planningResults && (
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    {planningResults.overallShortage} Shortage Identified
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {planningResults.efficiencyGain}% Efficiency Gain
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {planningResults.optimalSchedulingAccuracy}% Accuracy
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {staffCategories.map((category) => (
            <Card key={category.id} className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-8 h-8 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                      <category.icon className={`h-4 w-4 text-${category.color}-600`} />
                    </div>
                    <span className="text-lg">{category.category}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDemandColor(category.demand)}>
                      {category.demand} Demand
                    </Badge>
                    <Badge className={getWorkloadColor(category.workload)}>
                      {category.workload}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{category.current}</div>
                    <div className="text-xs text-gray-600">Current</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{category.predicted}</div>
                    <div className="text-xs text-gray-600">Predicted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{category.shortage}</div>
                    <div className="text-xs text-gray-600">Shortage</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${category.color}-600 h-2 rounded-full`}
                    style={{ width: `${category.efficiency}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Efficiency: {category.efficiency}%
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Key Skills:</h5>
                    <div className="flex flex-wrap gap-1">
                      {category.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">4-Week Forecast:</h5>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">W1</div>
                        <div>{category.forecast.week1}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">W2</div>
                        <div>{category.forecast.week2}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">W3</div>
                        <div>{category.forecast.week3}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">W4</div>
                        <div>{category.forecast.week4}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demand Factors */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <TrendingUp className="h-6 w-6" />
              <span>Demand Impact Factors</span>
            </CardTitle>
            <CardDescription>Key factors influencing manpower requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demandFactors.map((factor, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-800 text-sm">{factor.factor}</span>
                    <Badge variant="outline" className="text-xs">
                      {factor.confidence}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-xl font-bold ${getImpactColor(factor.impact)}`}>
                      {factor.impact}
                    </div>
                    <div className="text-xs text-gray-600">{factor.timeframe}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Planning Results */}
        {planningResults && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Target className="h-6 w-6" />
                <span>Predictive Planning Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {planningResults.predictedRequirement}
                  </div>
                  <div className="text-sm text-gray-600">Predicted Staff Need</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {planningResults.overallShortage}
                  </div>
                  <div className="text-sm text-gray-600">Staff Shortage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {planningResults.efficiencyGain}%
                  </div>
                  <div className="text-sm text-gray-600">Efficiency Gain</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {planningResults.costOptimization}%
                  </div>
                  <div className="text-sm text-gray-600">Cost Optimization</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Optimization Benefits:</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patient Satisfaction:</span>
                      <span className="font-medium text-green-600">+{planningResults.patientSatisfactionImprovement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduling Accuracy:</span>
                      <span className="font-medium text-blue-600">{planningResults.optimalSchedulingAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Mitigation:</span>
                      <span className="font-medium text-purple-600">{planningResults.riskMitigation}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Recommendations:</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Hire 13 additional RNs within 4 weeks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Cross-train existing staff for flexibility</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Implement predictive scheduling system</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 text-center">
                Analysis completed: {new Date(planningResults.analysisTimestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-5 w-5 mr-2" />
            Detailed Analytics
          </Button>
          <Button size="lg" variant="outline" className="border-green-300 text-green-700">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Optimization
          </Button>
          <Button size="lg" variant="outline" className="border-purple-300 text-purple-700">
            <Target className="h-5 w-5 mr-2" />
            Hiring Plan
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-semibold text-lg">🧠 Predictive Manpower Planning System 🧠</p>
          <p>Current: {totalCurrentStaff} | Predicted: {totalPredictedStaff} | Shortage: {totalShortage} | Efficiency: {averageEfficiency.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}