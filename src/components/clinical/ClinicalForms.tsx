import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Heart,
  Stethoscope,
  Clipboard,
  RefreshCw
} from 'lucide-react';

export default function ClinicalForms() {
  const [selectedForm, setSelectedForm] = useState(null);

  const clinicalForms = [
    {
      id: 'CF001',
      name: 'Initial Assessment Form',
      category: 'Assessment',
      status: 'Active',
      lastUpdated: '2024-01-15',
      completionRate: 95,
      dohCompliant: true,
      description: 'Comprehensive initial patient assessment including 9-domain evaluation'
    },
    {
      id: 'CF002', 
      name: 'Wound Care Documentation',
      category: 'Treatment',
      status: 'Active',
      lastUpdated: '2024-01-14',
      completionRate: 88,
      dohCompliant: true,
      description: 'Detailed wound assessment and treatment documentation with photo integration'
    },
    {
      id: 'CF003',
      name: 'Medication Administration Record',
      category: 'Medication',
      status: 'Active',
      lastUpdated: '2024-01-13',
      completionRate: 92,
      dohCompliant: true,
      description: 'Electronic medication administration tracking and verification'
    },
    {
      id: 'CF004',
      name: 'Vital Signs Monitoring',
      category: 'Monitoring',
      status: 'Active',
      lastUpdated: '2024-01-12',
      completionRate: 97,
      dohCompliant: true,
      description: 'Continuous vital signs tracking with automated alerts'
    },
    {
      id: 'CF005',
      name: 'Care Plan Review',
      category: 'Planning',
      status: 'Draft',
      lastUpdated: '2024-01-11',
      completionRate: 75,
      dohCompliant: true,
      description: 'Comprehensive care plan evaluation and updates'
    },
    {
      id: 'CF006',
      name: 'Discharge Planning',
      category: 'Discharge',
      status: 'Active',
      lastUpdated: '2024-01-10',
      completionRate: 85,
      dohCompliant: true,
      description: 'Patient discharge preparation and follow-up planning'
    }
  ];

  const formCategories = [
    { name: 'Assessment', count: 4, icon: Clipboard },
    { name: 'Treatment', count: 3, icon: Heart },
    { name: 'Medication', count: 2, icon: Stethoscope },
    { name: 'Monitoring', count: 5, icon: CheckCircle2 },
    { name: 'Planning', count: 2, icon: FileText }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Inactive': return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Clinical Documentation</h1>
              <p className="text-gray-600">DOH-compliant clinical forms and documentation system</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </div>

        {/* Form Categories */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {formCategories.map((category, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <category.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{category.count}</div>
                  <div className="text-sm text-gray-600">{category.name}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DOH Compliance Status */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>DOH Compliance Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">16</div>
                <div className="text-sm text-gray-600">Total Forms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">DOH Compliant</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">9</div>
                <div className="text-sm text-gray-600">Assessment Domains</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Forms List */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Forms</CardTitle>
            <CardDescription>
              Mobile-optimized forms with electronic signatures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clinicalForms.map((form) => (
                <div key={form.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(form.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{form.name}</h3>
                          <Badge className={getStatusColor(form.status)}>
                            {form.status}
                          </Badge>
                          {form.dohCompliant && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              DOH Compliant
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Category: {form.category} | ID: {form.id}</div>
                          <div>{form.description}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-sm text-gray-600">
                        <div>Last Updated: {form.lastUpdated}</div>
                        <div>Completion: {form.completionRate}%</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Use Form
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Features */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Stethoscope className="h-5 w-5" />
              <span>Mobile-First Features</span>
            </CardTitle>
            <CardDescription>Advanced mobile capabilities for healthcare professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Offline Capability</h4>
                <p className="text-sm text-gray-600">Complete forms without internet connection, sync when online</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Voice-to-Text</h4>
                <p className="text-sm text-gray-600">Medical terminology recognition for faster documentation</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Camera Integration</h4>
                <p className="text-sm text-gray-600">Wound documentation with integrated photo capture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>Clinical Documentation System - DOH Compliant | Electronic Signatures Enabled</p>
        </div>
      </div>
    </div>
  );
}