import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

export default function DOHCompliance() {
  const [selectedDomain, setSelectedDomain] = useState(null);

  const complianceMetrics = {
    overallScore: 98.5,
    totalAssessments: 1247,
    compliantRecords: 1228,
    pendingReviews: 19,
    lastAudit: '2024-01-10',
    nextAudit: '2024-04-10'
  };

  const nineDomains = [
    {
      id: 1,
      name: 'Patient Safety',
      score: 99,
      status: 'Compliant',
      lastReview: '2024-01-15',
      requirements: 12,
      completed: 12,
      description: 'Patient safety protocols and incident reporting'
    },
    {
      id: 2,
      name: 'Clinical Governance',
      score: 97,
      status: 'Compliant',
      lastReview: '2024-01-14',
      requirements: 15,
      completed: 15,
      description: 'Clinical decision-making and quality assurance'
    },
    {
      id: 3,
      name: 'Infection Prevention',
      score: 100,
      status: 'Compliant',
      lastReview: '2024-01-13',
      requirements: 8,
      completed: 8,
      description: 'Infection control measures and protocols'
    },
    {
      id: 4,
      name: 'Medication Management',
      score: 96,
      status: 'Compliant',
      lastReview: '2024-01-12',
      requirements: 10,
      completed: 10,
      description: 'Safe medication administration and storage'
    },
    {
      id: 5,
      name: 'Documentation Standards',
      score: 98,
      status: 'Compliant',
      lastReview: '2024-01-11',
      requirements: 20,
      completed: 20,
      description: 'Clinical documentation and record keeping'
    },
    {
      id: 6,
      name: 'Staff Competency',
      score: 95,
      status: 'Review Required',
      lastReview: '2024-01-10',
      requirements: 18,
      completed: 17,
      description: 'Healthcare professional qualifications and training'
    },
    {
      id: 7,
      name: 'Equipment Management',
      score: 99,
      status: 'Compliant',
      lastReview: '2024-01-09',
      requirements: 6,
      completed: 6,
      description: 'Medical equipment maintenance and calibration'
    },
    {
      id: 8,
      name: 'Emergency Preparedness',
      score: 97,
      status: 'Compliant',
      lastReview: '2024-01-08',
      requirements: 9,
      completed: 9,
      description: 'Emergency response procedures and protocols'
    },
    {
      id: 9,
      name: 'Quality Improvement',
      score: 98,
      status: 'Compliant',
      lastReview: '2024-01-07',
      requirements: 14,
      completed: 14,
      description: 'Continuous quality improvement initiatives'
    }
  ];

  const recentAudits = [
    {
      date: '2024-01-10',
      type: 'DOH Inspection',
      result: 'Passed',
      score: 98.5,
      findings: 2,
      status: 'Closed'
    },
    {
      date: '2023-10-15',
      type: 'Internal Audit',
      result: 'Passed',
      score: 97.2,
      findings: 3,
      status: 'Closed'
    },
    {
      date: '2023-07-20',
      type: 'DOH Follow-up',
      result: 'Passed',
      score: 99.1,
      findings: 1,
      status: 'Closed'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'Review Required': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Non-Compliant': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Compliant': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Review Required': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Non-Compliant': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">DOH Compliance Dashboard</h1>
              <p className="text-gray-600">UAE Ministry of Health and Prevention compliance monitoring</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{complianceMetrics.overallScore}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{complianceMetrics.totalAssessments}</div>
              <div className="text-sm text-gray-600">Total Assessments</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{complianceMetrics.compliantRecords}</div>
              <div className="text-sm text-gray-600">Compliant Records</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{complianceMetrics.pendingReviews}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-sm font-bold text-purple-600">{complianceMetrics.lastAudit}</div>
              <div className="text-sm text-gray-600">Last Audit</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-sm font-bold text-teal-600">{complianceMetrics.nextAudit}</div>
              <div className="text-sm text-gray-600">Next Audit</div>
            </CardContent>
          </Card>
        </div>

        {/* DOH 9-Domain Assessment */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <BarChart3 className="h-5 w-5" />
              <span>DOH 9-Domain Assessment</span>
            </CardTitle>
            <CardDescription>
              Comprehensive compliance assessment across all DOH domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nineDomains.map((domain) => (
                <div key={domain.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(domain.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">Domain {domain.id}: {domain.name}</h3>
                          <Badge className={getStatusColor(domain.status)}>
                            {domain.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{domain.description}</div>
                          <div>Requirements: {domain.completed}/{domain.requirements} completed</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-green-600">{domain.score}%</div>
                      <div className="text-sm text-gray-600">
                        <div>Last Review: {domain.lastReview}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Audits & Inspections</span>
            </CardTitle>
            <CardDescription>
              DOH inspections and internal audit results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{audit.type}</div>
                      <div className="text-sm text-gray-600">{audit.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-green-600">{audit.result}</div>
                        <div className="text-sm text-gray-600">Score: {audit.score}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Findings: {audit.findings}</div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {audit.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <Clock className="h-5 w-5" />
                <span>Upcoming Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Staff Competency Review</div>
                  <div className="text-xs text-blue-600">Due: 2024-01-25 | Domain 6</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">Equipment Calibration</div>
                  <div className="text-xs text-yellow-600">Due: 2024-02-01 | Domain 7</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-800">Quality Audit Preparation</div>
                  <div className="text-xs text-green-600">Due: 2024-04-01 | All Domains</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Users className="h-5 w-5" />
                <span>Compliance Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Quality Manager</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Compliance Officer</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Clinical Director</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Safety Coordinator</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>DOH Compliance Dashboard - UAE Ministry of Health and Prevention Standards</p>
          <p>Last Updated: {new Date().toLocaleDateString()} | Next Audit: {complianceMetrics.nextAudit}</p>
        </div>
      </div>
    </div>
  );
}