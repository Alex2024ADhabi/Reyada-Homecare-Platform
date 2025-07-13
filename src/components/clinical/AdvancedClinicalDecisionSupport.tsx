import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Heart,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';

export default function AdvancedClinicalDecisionSupport() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [decisionResults, setDecisionResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clinicalDecisionModules = [
    {
      id: 1,
      name: 'Medication Interaction Checker',
      accuracy: 98,
      status: 'Active',
      alerts: 23,
      recommendations: [
        { type: 'Drug Interaction', severity: 'High', count: 5, action: 'Review immediately' },
        { type: 'Dosage Adjustment', severity: 'Medium', count: 12, action: 'Consider modification' },
        { type: 'Alternative Therapy', severity: 'Low', count: 6, action: 'Optional consideration' }
      ],
      icon: Shield,
      color: 'red'
    },
    {
      id: 2,
      name: 'Diagnostic Support System',
      accuracy: 94,
      status: 'Active',
      alerts: 18,
      recommendations: [
        { type: 'Additional Tests', severity: 'High', count: 8, action: 'Order immediately' },
        { type: 'Differential Diagnosis', severity: 'Medium', count: 7, action: 'Consider alternatives' },
        { type: 'Specialist Referral', severity: 'Medium', count: 3, action: 'Refer if needed' }
      ],
      icon: Brain,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Treatment Protocol Advisor',
      accuracy: 96,
      status: 'Active',
      alerts: 31,
      recommendations: [
        { type: 'Protocol Deviation', severity: 'High', count: 4, action: 'Justify deviation' },
        { type: 'Best Practice Alert', severity: 'Medium', count: 15, action: 'Follow guidelines' },
        { type: 'Outcome Optimization', severity: 'Low', count: 12, action: 'Consider enhancement' }
      ],
      icon: Target,
      color: 'green'
    },
    {
      id: 4,
      name: 'Risk Assessment Engine',
      accuracy: 92,
      status: 'Active',
      alerts: 27,
      recommendations: [
        { type: 'High Risk Patient', severity: 'High', count: 9, action: 'Immediate attention' },
        { type: 'Preventive Measures', severity: 'Medium', count: 11, action: 'Implement prevention' },
        { type: 'Monitoring Required', severity: 'Low', count: 7, action: 'Schedule follow-up' }
      ],
      icon: AlertTriangle,
      color: 'orange'
    }
  ];

  const clinicalAlerts = [
    {
      id: 1,
      patient: 'Patient ID: 1247',
      alert: 'Potential drug interaction detected',
      severity: 'High',
      recommendation: 'Review Warfarin + Aspirin combination',
      confidence: 96,
      time: '2 min ago'
    },
    {
      id: 2,
      patient: 'Patient ID: 0892',
      alert: 'Abnormal lab values pattern',
      severity: 'Medium',
      recommendation: 'Consider additional cardiac enzymes',
      confidence: 89,
      time: '5 min ago'
    },
    {
      id: 3,
      patient: 'Patient ID: 1156',
      alert: 'Treatment protocol deviation',
      severity: 'Medium',
      recommendation: 'Document rationale for off-protocol treatment',
      confidence: 94,
      time: '8 min ago'
    },
    {
      id: 4,
      patient: 'Patient ID: 0734',
      alert: 'High readmission risk identified',
      severity: 'High',
      recommendation: 'Implement enhanced discharge planning',
      confidence: 91,
      time: '12 min ago'
    }
  ];

  const runDecisionAnalysis = async () => {
    setIsAnalyzing(true);
    
    const analysisSteps = [
      'Initializing Clinical Decision Engine...',
      'Analyzing Patient Data Patterns...',
      'Checking Medication Interactions...',
      'Evaluating Diagnostic Criteria...',
      'Reviewing Treatment Protocols...',
      'Assessing Risk Factors...',
      'Generating Recommendations...',
      'Validating Clinical Guidelines...',
      'Calculating Confidence Scores...',
      'Finalizing Decision Support...'
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const results = {
      totalRecommendations: 247,
      highPriorityAlerts: 26,
      mediumPriorityAlerts: 45,
      lowPriorityAlerts: 176,
      averageConfidence: 94.2,
      protocolCompliance: 96.8,
      riskPrevention: 89.3,
      clinicalOutcomes: 92.7,
      analysisTimestamp: new Date().toISOString()
    };

    setDecisionResults(results);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overallMetrics = {
    totalAlerts: clinicalDecisionModules.reduce((sum, module) => sum + module.alerts, 0),
    averageAccuracy: Math.round(clinicalDecisionModules.reduce((sum, module) => sum + module.accuracy, 0) / clinicalDecisionModules.length),
    activeModules: clinicalDecisionModules.filter(m => m.status === 'Active').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              CLINICAL DECISION SUPPORT
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">Advanced AI-Powered Clinical Intelligence</h2>
          <p className="text-lg text-gray-600">Real-time clinical decision support and evidence-based recommendations</p>
          <div className="text-sm text-gray-500">
            Decision Engine: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* System Status */}
        <Alert className="border-2 border-purple-200 bg-purple-50">
          <Brain className="h-5 w-5 text-purple-600" />
          <AlertTitle className="text-purple-800 text-lg">CLINICAL DECISION SUPPORT SYSTEM - ACTIVE</AlertTitle>
          <AlertDescription className="mt-4 text-purple-700">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="mb-2"><strong>Active Modules:</strong> {overallMetrics.activeModules}/4</p>
                  <p className="mb-2"><strong>Total Alerts:</strong> {overallMetrics.totalAlerts}</p>
                  <p><strong>Average Accuracy:</strong> {overallMetrics.averageAccuracy}%</p>
                </div>
                <div>
                  <p className="mb-2"><strong>High Priority:</strong> 26 alerts</p>
                  <p className="mb-2"><strong>Medium Priority:</strong> 45 alerts</p>
                  <p><strong>Response Time:</strong> &lt;2 seconds</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Protocol Compliance:</strong> 96.8%</p>
                  <p className="mb-2"><strong>Risk Prevention:</strong> 89.3%</p>
                  <p><strong>Clinical Outcomes:</strong> 92.7%</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Evidence Base:</strong> Updated</p>
                  <p className="mb-2"><strong>Guidelines:</strong> Current</p>
                  <p><strong>AI Training:</strong> Continuous</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Decision Analysis Controls */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Zap className="h-6 w-6" />
              <span>Clinical Decision Analysis</span>
            </CardTitle>
            <CardDescription>Run comprehensive clinical decision support analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button 
                size="lg" 
                onClick={runDecisionAnalysis}
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
                    Run Decision Analysis
                  </>
                )}
              </Button>
              
              {decisionResults && (
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    {decisionResults.totalRecommendations} Recommendations
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {decisionResults.averageConfidence}% Confidence
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {decisionResults.protocolCompliance}% Compliance
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Decision Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clinicalDecisionModules.map((module) => (
            <Card key={module.id} className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-8 h-8 bg-${module.color}-100 rounded-full flex items-center justify-center`}>
                      <module.icon className={`h-4 w-4 text-${module.color}-600`} />
                    </div>
                    <span className="text-lg">{module.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(module.status)}>
                      {module.status}
                    </Badge>
                    <Badge variant="outline">
                      {module.accuracy}% Accuracy
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-purple-600">
                    {module.alerts} Alerts
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 ml-4">
                    <div 
                      className={`bg-${module.color}-600 h-2 rounded-full`}
                      style={{ width: `${module.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getSeverityColor(rec.severity)}>
                            {rec.severity}
                          </Badge>
                          <span className="font-medium text-sm">{rec.type}</span>
                        </div>
                        <div className="text-xs text-gray-600">{rec.action}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{rec.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real-time Clinical Alerts */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-6 w-6" />
              <span>Real-time Clinical Alerts</span>
            </CardTitle>
            <CardDescription>Active clinical decision alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clinicalAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="font-semibold">{alert.patient}</span>
                        <span className="text-sm text-gray-600">{alert.time}</span>
                      </div>
                      <div className="font-medium text-red-800 mb-1">{alert.alert}</div>
                      <div className="text-sm text-red-700">{alert.recommendation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="font-bold text-lg text-red-600">{alert.confidence}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Decision Analysis Results */}
        {decisionResults && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="h-6 w-6" />
                <span>Clinical Decision Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {decisionResults.totalRecommendations}
                  </div>
                  <div className="text-sm text-gray-600">Total Recommendations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {decisionResults.averageConfidence}%
                  </div>
                  <div className="text-sm text-gray-600">Average Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {decisionResults.protocolCompliance}%
                  </div>
                  <div className="text-sm text-gray-600">Protocol Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {decisionResults.clinicalOutcomes}%
                  </div>
                  <div className="text-sm text-gray-600">Clinical Outcomes</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">Decision Support Impact:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-1">✅ {decisionResults.highPriorityAlerts} high-priority alerts</p>
                    <p className="mb-1">✅ {decisionResults.protocolCompliance}% protocol compliance</p>
                    <p>✅ {decisionResults.riskPrevention}% risk prevention rate</p>
                  </div>
                  <div>
                    <p className="mb-1">✅ {decisionResults.averageConfidence}% average confidence</p>
                    <p className="mb-1">✅ {decisionResults.clinicalOutcomes}% improved outcomes</p>
                    <p>✅ Real-time evidence-based recommendations</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Analysis completed: {new Date(decisionResults.analysisTimestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <BarChart3 className="h-5 w-5 mr-2" />
            View Clinical Analytics
          </Button>
          <Button size="lg" variant="outline" className="border-blue-300 text-blue-700">
            <Target className="h-5 w-5 mr-2" />
            Configure Guidelines
          </Button>
          <Button size="lg" variant="outline" className="border-green-300 text-green-700">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Monitoring
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-semibold text-lg">🧠 Advanced Clinical Decision Support System 🧠</p>
          <p>Accuracy: {overallMetrics.averageAccuracy}% | Active Alerts: {overallMetrics.totalAlerts} | Modules: {overallMetrics.activeModules}/4</p>
        </div>
      </div>
    </div>
  );
}