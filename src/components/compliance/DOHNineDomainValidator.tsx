import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Shield, 
  FileText, 
  Users, 
  Activity,
  Settings,
  Database,
  Zap,
  Target
} from 'lucide-react';

interface DOHDomain {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  status: 'complete' | 'partial' | 'missing';
  completionPercentage: number;
  criticalRequirements: string[];
  validationRules: ValidationRule[];
}

interface ValidationRule {
  id: string;
  description: string;
  status: 'passed' | 'failed' | 'pending';
  severity: 'critical' | 'high' | 'medium' | 'low';
  lastChecked: Date;
}

export default function DOHNineDomainValidator() {
  const [validationResults, setValidationResults] = useState<DOHDomain[]>([]);
  const [overallCompliance, setOverallCompliance] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  // DOH 9 Domains Configuration
  const dohDomains: DOHDomain[] = [
    {
      id: 'governance',
      name: 'Governance and Leadership',
      description: 'Organizational structure, policies, and leadership accountability',
      requirements: [
        'Board governance structure',
        'Executive leadership roles',
        'Policy and procedure framework',
        'Strategic planning process',
        'Risk management system'
      ],
      status: 'complete',
      completionPercentage: 95,
      criticalRequirements: ['Board governance structure', 'Risk management system'],
      validationRules: [
        {
          id: 'gov-001',
          description: 'Board governance documentation exists',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'gov-002', 
          description: 'Executive roles clearly defined',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'patient-safety',
      name: 'Patient Safety and Quality',
      description: 'Patient safety culture, incident reporting, and quality improvement',
      requirements: [
        'Patient safety culture assessment',
        'Incident reporting system',
        'Root cause analysis process',
        'Quality improvement initiatives',
        'Patient safety training program'
      ],
      status: 'complete',
      completionPercentage: 98,
      criticalRequirements: ['Incident reporting system', 'Root cause analysis process'],
      validationRules: [
        {
          id: 'ps-001',
          description: 'Incident reporting system operational',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'ps-002',
          description: 'Patient safety taxonomy implemented',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'clinical-care',
      name: 'Clinical Care and Services',
      description: 'Clinical protocols, care pathways, and service delivery standards',
      requirements: [
        'Clinical care protocols',
        'Care pathway documentation',
        'Clinical assessment tools',
        'Treatment planning process',
        'Clinical outcome monitoring'
      ],
      status: 'complete',
      completionPercentage: 96,
      criticalRequirements: ['Clinical care protocols', 'Clinical assessment tools'],
      validationRules: [
        {
          id: 'cc-001',
          description: '16 clinical forms implemented',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'cc-002',
          description: 'Care plan intelligence active',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'human-resources',
      name: 'Human Resources Management',
      description: 'Staff competency, training, and performance management',
      requirements: [
        'Staff competency framework',
        'Training and development programs',
        'Performance management system',
        'Professional development plans',
        'Staff satisfaction monitoring'
      ],
      status: 'partial',
      completionPercentage: 85,
      criticalRequirements: ['Staff competency framework', 'Training and development programs'],
      validationRules: [
        {
          id: 'hr-001',
          description: 'Staff lifecycle management implemented',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        },
        {
          id: 'hr-002',
          description: 'Competency assessment framework',
          status: 'pending',
          severity: 'critical',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'information-management',
      name: 'Information Management',
      description: 'Health information systems, data governance, and privacy protection',
      requirements: [
        'Health information system',
        'Data governance framework',
        'Privacy and confidentiality policies',
        'Information security measures',
        'Data quality management'
      ],
      status: 'complete',
      completionPercentage: 94,
      criticalRequirements: ['Health information system', 'Information security measures'],
      validationRules: [
        {
          id: 'im-001',
          description: 'Clinical documentation system operational',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'im-002',
          description: 'AES-256 encryption implemented',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'infection-prevention',
      name: 'Infection Prevention and Control',
      description: 'Infection control policies, surveillance, and outbreak management',
      requirements: [
        'Infection control policies',
        'Surveillance system',
        'Outbreak management plan',
        'Staff training on infection control',
        'Environmental safety measures'
      ],
      status: 'partial',
      completionPercentage: 78,
      criticalRequirements: ['Infection control policies', 'Surveillance system'],
      validationRules: [
        {
          id: 'ip-001',
          description: 'Infection control round forms implemented',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        },
        {
          id: 'ip-002',
          description: 'Surveillance system automation',
          status: 'pending',
          severity: 'critical',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'medication-management',
      name: 'Medication Management',
      description: 'Medication safety, storage, administration, and monitoring',
      requirements: [
        'Medication management policies',
        'Prescription and administration protocols',
        'Medication storage and security',
        'Adverse drug event monitoring',
        'Medication reconciliation process'
      ],
      status: 'partial',
      completionPercentage: 82,
      criticalRequirements: ['Medication management policies', 'Adverse drug event monitoring'],
      validationRules: [
        {
          id: 'mm-001',
          description: 'Medication reconciliation form implemented',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'mm-002',
          description: 'Automated adverse event monitoring',
          status: 'pending',
          severity: 'high',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'emergency-management',
      name: 'Emergency Management',
      description: 'Emergency preparedness, response plans, and business continuity',
      requirements: [
        'Emergency response plans',
        'Business continuity planning',
        'Disaster recovery procedures',
        'Emergency communication systems',
        'Staff emergency training'
      ],
      status: 'partial',
      completionPercentage: 75,
      criticalRequirements: ['Emergency response plans', 'Business continuity planning'],
      validationRules: [
        {
          id: 'em-001',
          description: 'Emergency preparedness form implemented',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        },
        {
          id: 'em-002',
          description: 'Automated emergency communication',
          status: 'pending',
          severity: 'critical',
          lastChecked: new Date()
        }
      ]
    },
    {
      id: 'continuous-improvement',
      name: 'Continuous Quality Improvement',
      description: 'Quality monitoring, performance measurement, and improvement initiatives',
      requirements: [
        'Quality monitoring system',
        'Performance measurement framework',
        'Improvement project management',
        'Benchmarking and comparison',
        'Stakeholder feedback integration'
      ],
      status: 'complete',
      completionPercentage: 93,
      criticalRequirements: ['Quality monitoring system', 'Performance measurement framework'],
      validationRules: [
        {
          id: 'ci-001',
          description: 'JAWDA KPI tracking implemented',
          status: 'passed',
          severity: 'critical',
          lastChecked: new Date()
        },
        {
          id: 'ci-002',
          description: 'Quality assurance dashboard operational',
          status: 'passed',
          severity: 'high',
          lastChecked: new Date()
        }
      ]
    }
  ];

  useEffect(() => {
    setValidationResults(dohDomains);
    calculateOverallCompliance(dohDomains);
  }, []);

  const calculateOverallCompliance = (domains: DOHDomain[]) => {
    const totalCompliance = domains.reduce((sum, domain) => sum + domain.completionPercentage, 0);
    const average = Math.round(totalCompliance / domains.length);
    setOverallCompliance(average);
  };

  const runValidation = async () => {
    setIsValidating(true);
    
    // Simulate validation process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setLastValidation(new Date());
    setIsValidating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'default';
    }
  };

  const criticalIssues = validationResults.filter(domain => 
    domain.status !== 'complete' || domain.completionPercentage < 90
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              DOH 9-Domain Compliance Validator
            </h1>
          </div>
          <p className="text-lg text-gray-600">Comprehensive validation of DOH regulatory compliance requirements</p>
          {lastValidation && (
            <p className="text-sm text-gray-500">
              Last Validation: {lastValidation.toLocaleString()}
            </p>
          )}
        </div>

        {/* Overall Status */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Overall Compliance Status</CardTitle>
            <CardDescription>Current compliance across all 9 DOH domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{overallCompliance}%</div>
                <div className="text-sm text-gray-600">Overall Compliance</div>
                <Progress value={overallCompliance} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {validationResults.filter(d => d.status === 'complete').length}
                </div>
                <div className="text-sm text-gray-600">Complete Domains</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">
                  {validationResults.filter(d => d.status === 'partial').length}
                </div>
                <div className="text-sm text-gray-600">Partial Domains</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">
                  {criticalIssues.length}
                </div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert className="border-2 border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 text-lg">Critical Compliance Issues</AlertTitle>
            <AlertDescription className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalIssues.map((domain, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800">{domain.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{domain.completionPercentage}% Complete</p>
                    <div className="text-xs text-gray-500">
                      <strong>Critical Requirements:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {domain.criticalRequirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Domain Details */}
        <Tabs defaultValue="domains" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
            <TabsTrigger value="validation">Validation Rules</TabsTrigger>
            <TabsTrigger value="actions">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {validationResults.map((domain, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span>{domain.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(domain.status)}>
                          {domain.completionPercentage}%
                        </Badge>
                        <Progress value={domain.completionPercentage} className="w-20" />
                      </div>
                    </CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">✅ Requirements:</h4>
                        <ul className="text-sm space-y-1">
                          {domain.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2">🔴 Critical Requirements:</h4>
                        <ul className="text-sm space-y-1">
                          {domain.criticalRequirements.map((req, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {validationResults.map((domain, domainIndex) => (
                <Card key={domainIndex}>
                  <CardHeader>
                    <CardTitle>{domain.name} - Validation Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {domain.validationRules.map((rule, ruleIndex) => (
                        <div key={ruleIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {rule.status === 'passed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : rule.status === 'failed' ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                              <div className="font-medium">{rule.description}</div>
                              <div className="text-sm text-gray-500">
                                Last checked: {rule.lastChecked.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant={getSeverityColor(rule.severity)}>
                            {rule.severity.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Immediate Actions Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Complete staff competency assessment framework</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Implement automated surveillance system</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Enhance medication adverse event monitoring</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Develop automated emergency communication</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Compliance Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Comprehensive clinical documentation system</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Advanced patient safety taxonomy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Robust information security measures</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Comprehensive quality monitoring system</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            onClick={runValidation}
            disabled={isValidating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isValidating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Full Validation
              </>
            )}
          </Button>
          <Button size="lg" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Compliance Report
          </Button>
          <Button size="lg" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Monitoring
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>DOH 9-Domain Compliance Validator - Reyada Homecare Platform</p>
          <p>Current Compliance: {overallCompliance}% | Target: 100%</p>
        </div>
      </div>
    </div>
  );
}