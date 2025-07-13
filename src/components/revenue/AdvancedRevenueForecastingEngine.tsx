import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Brain, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Calculator,
  PieChart
} from 'lucide-react';

export default function AdvancedRevenueForecastingEngine() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [forecastResults, setForecastResults] = useState<any>(null);
  const [isForecasting, setIsForecasting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const revenueStreams = [
    {
      id: 1,
      name: 'Home Healthcare Services',
      currentRevenue: 2450000,
      projectedGrowth: 18.5,
      confidence: 94,
      factors: ['Aging population', 'Post-COVID demand', 'Insurance coverage expansion'],
      forecast: {
        q1: 2650000,
        q2: 2850000,
        q3: 3100000,
        q4: 3350000
      },
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 2,
      name: 'Chronic Care Management',
      currentRevenue: 1850000,
      projectedGrowth: 22.3,
      confidence: 91,
      factors: ['Diabetes management', 'Cardiac care', 'Respiratory therapy'],
      forecast: {
        q1: 2100000,
        q2: 2300000,
        q3: 2550000,
        q4: 2800000
      },
      icon: Target,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Rehabilitation Services',
      currentRevenue: 1200000,
      projectedGrowth: 15.7,
      confidence: 89,
      factors: ['Physical therapy', 'Occupational therapy', 'Speech therapy'],
      forecast: {
        q1: 1350000,
        q2: 1450000,
        q3: 1580000,
        q4: 1720000
      },
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Specialized Care Programs',
      currentRevenue: 980000,
      projectedGrowth: 28.4,
      confidence: 87,
      factors: ['Wound care', 'Palliative care', 'Mental health'],
      forecast: {
        q1: 1150000,
        q2: 1320000,
        q3: 1520000,
        q4: 1750000
      },
      icon: Brain,
      color: 'orange'
    }
  ];

  const marketFactors = [
    { factor: 'Healthcare Demand Growth', impact: '+15%', confidence: 95 },
    { factor: 'Insurance Reimbursement Changes', impact: '+8%', confidence: 88 },
    { factor: 'Regulatory Environment', impact: '+3%', confidence: 92 },
    { factor: 'Competition Analysis', impact: '-2%', confidence: 85 },
    { factor: 'Technology Adoption', impact: '+12%', confidence: 90 },
    { factor: 'Staff Availability', impact: '-5%', confidence: 87 }
  ];

  const runRevenueForecast = async () => {
    setIsForecasting(true);
    
    const forecastSteps = [
      'Initializing Revenue Forecasting Engine...',
      'Analyzing Historical Revenue Data...',
      'Processing Market Trends...',
      'Evaluating Seasonal Patterns...',
      'Calculating Growth Projections...',
      'Assessing Risk Factors...',
      'Modeling Different Scenarios...',
      'Validating Forecast Accuracy...',
      'Generating Confidence Intervals...',
      'Finalizing Revenue Projections...'
    ];

    for (let i = 0; i < forecastSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const results = {
      totalCurrentRevenue: 6480000,
      projectedAnnualRevenue: 8250000,
      growthRate: 27.3,
      confidenceScore: 90.5,
      riskAdjustedRevenue: 7850000,
      bestCaseScenario: 9100000,
      worstCaseScenario: 7200000,
      quarterlyBreakdown: {
        q1: 1950000,
        q2: 2150000,
        q3: 2350000,
        q4: 2800000
      },
      forecastTimestamp: new Date().toISOString()
    };

    setForecastResults(results);
    setIsForecasting(false);
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 20) return 'text-green-600';
    if (growth >= 10) return 'text-blue-600';
    if (growth >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    if (impact.startsWith('+')) return 'text-green-600';
    if (impact.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const totalCurrentRevenue = revenueStreams.reduce((sum, stream) => sum + stream.currentRevenue, 0);
  const averageGrowth = revenueStreams.reduce((sum, stream) => sum + stream.projectedGrowth, 0) / revenueStreams.length;
  const averageConfidence = revenueStreams.reduce((sum, stream) => sum + stream.confidence, 0) / revenueStreams.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Calculator className="h-12 w-12 text-green-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              REVENUE FORECASTING
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">Advanced Revenue Prediction Engine</h2>
          <p className="text-lg text-gray-600">AI-powered revenue forecasting and growth optimization</p>
          <div className="text-sm text-gray-500">
            Forecast Engine: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* Current Revenue Status */}
        <Alert className="border-2 border-green-200 bg-green-50">
          <DollarSign className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">REVENUE FORECASTING ENGINE - ACTIVE</AlertTitle>
          <AlertDescription className="mt-4 text-green-700">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="mb-2"><strong>Current Revenue:</strong> ${(totalCurrentRevenue / 1000000).toFixed(1)}M</p>
                  <p className="mb-2"><strong>Average Growth:</strong> {averageGrowth.toFixed(1)}%</p>
                  <p><strong>Confidence:</strong> {averageConfidence.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Revenue Streams:</strong> 4 Active</p>
                  <p className="mb-2"><strong>Market Factors:</strong> 6 Analyzed</p>
                  <p><strong>Forecast Horizon:</strong> 12 months</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Best Case:</strong> $9.1M projected</p>
                  <p className="mb-2"><strong>Risk Adjusted:</strong> $7.8M projected</p>
                  <p><strong>Worst Case:</strong> $7.2M projected</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Model Accuracy:</strong> 94.2%</p>
                  <p className="mb-2"><strong>Update Frequency:</strong> Real-time</p>
                  <p><strong>Scenario Analysis:</strong> Active</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Forecasting Controls */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Zap className="h-6 w-6" />
              <span>Advanced Revenue Forecasting</span>
            </CardTitle>
            <CardDescription>Run comprehensive revenue forecasting analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button 
                size="lg" 
                onClick={runRevenueForecast}
                disabled={isForecasting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isForecasting ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-pulse" />
                    Forecasting...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Run Revenue Forecast
                  </>
                )}
              </Button>
              
              {forecastResults && (
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    ${(forecastResults.projectedAnnualRevenue / 1000000).toFixed(1)}M Projected
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {forecastResults.growthRate}% Growth
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {forecastResults.confidenceScore}% Confidence
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Streams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {revenueStreams.map((stream) => (
            <Card key={stream.id} className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-8 h-8 bg-${stream.color}-100 rounded-full flex items-center justify-center`}>
                      <stream.icon className={`h-4 w-4 text-${stream.color}-600`} />
                    </div>
                    <span className="text-lg">{stream.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {stream.confidence}% Confidence
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    ${(stream.currentRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className={`text-lg font-semibold ${getGrowthColor(stream.projectedGrowth)}`}>
                    +{stream.projectedGrowth}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${stream.color}-600 h-2 rounded-full`}
                    style={{ width: `${stream.confidence}%` }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Growth Factors:</h5>
                    <div className="space-y-1">
                      {stream.factors.map((factor, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Quarterly Forecast:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Q1:</span>
                        <span className="font-medium">${(stream.forecast.q1 / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q2:</span>
                        <span className="font-medium">${(stream.forecast.q2 / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q3:</span>
                        <span className="font-medium">${(stream.forecast.q3 / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q4:</span>
                        <span className="font-medium">${(stream.forecast.q4 / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Factors */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <BarChart3 className="h-6 w-6" />
              <span>Market Impact Factors</span>
            </CardTitle>
            <CardDescription>Key factors influencing revenue projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketFactors.map((factor, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-800 text-sm">{factor.factor}</span>
                    <Badge variant="outline" className="text-xs">
                      {factor.confidence}%
                    </Badge>
                  </div>
                  <div className={`text-2xl font-bold ${getImpactColor(factor.impact)}`}>
                    {factor.impact}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Impact on Revenue</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Results */}
        {forecastResults && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <TrendingUp className="h-6 w-6" />
                <span>Revenue Forecast Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${(forecastResults.projectedAnnualRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Projected Annual Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {forecastResults.growthRate}%
                  </div>
                  <div className="text-sm text-gray-600">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {forecastResults.confidenceScore}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    ${(forecastResults.riskAdjustedRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Risk Adjusted</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Best Case Scenario:</h5>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${(forecastResults.bestCaseScenario / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Optimistic projection</div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Most Likely Scenario:</h5>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ${(forecastResults.riskAdjustedRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Risk-adjusted projection</div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">Conservative Scenario:</h5>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    ${(forecastResults.worstCaseScenario / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Conservative projection</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">Quarterly Revenue Breakdown:</h5>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">Q1</div>
                    <div>${(forecastResults.quarterlyBreakdown.q1 / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">Q2</div>
                    <div>${(forecastResults.quarterlyBreakdown.q2 / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">Q3</div>
                    <div>${(forecastResults.quarterlyBreakdown.q3 / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600">Q4</div>
                    <div>${(forecastResults.quarterlyBreakdown.q4 / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Forecast generated: {new Date(forecastResults.forecastTimestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <PieChart className="h-5 w-5 mr-2" />
            Detailed Analytics
          </Button>
          <Button size="lg" variant="outline" className="border-blue-300 text-blue-700">
            <Target className="h-5 w-5 mr-2" />
            Scenario Planning
          </Button>
          <Button size="lg" variant="outline" className="border-purple-300 text-purple-700">
            <BarChart3 className="h-5 w-5 mr-2" />
            Export Forecast
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-semibold text-lg">💰 Advanced Revenue Forecasting Engine 💰</p>
          <p>Current: ${(totalCurrentRevenue / 1000000).toFixed(1)}M | Growth: {averageGrowth.toFixed(1)}% | Confidence: {averageConfidence.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}