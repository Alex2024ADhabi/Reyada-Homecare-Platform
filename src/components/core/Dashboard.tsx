import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Users, 
  FileText, 
  Shield,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const healthcareMetrics = {
    totalPatients: 1247,
    activeEpisodes: 89,
    pendingAssessments: 23,
    complianceScore: 98.5,
    todayVisits: 45,
    criticalAlerts: 3
  };

  const quickActions = [
    { title: 'New Patient Registration', icon: Users, path: '/patients/new' },
    { title: 'Clinical Assessment', icon: FileText, path: '/clinical/assessment' },
    { title: 'DOH Compliance Check', icon: Shield, path: '/compliance/doh' },
    { title: 'Schedule Visit', icon: Calendar, path: '/scheduling' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Heart className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Reyada Homecare Platform
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            DOH-Compliant Digital Healthcare Management System
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{healthcareMetrics.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{healthcareMetrics.activeEpisodes}</div>
                <div className="text-sm text-gray-600">Active Episodes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{healthcareMetrics.pendingAssessments}</div>
                <div className="text-sm text-gray-600">Pending Assessments</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{healthcareMetrics.complianceScore}%</div>
                <div className="text-sm text-gray-600">DOH Compliance</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{healthcareMetrics.todayVisits}</div>
                <div className="text-sm text-gray-600">Today's Visits</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{healthcareMetrics.criticalAlerts}</div>
                <div className="text-sm text-gray-600">Critical Alerts</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common healthcare management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-sm text-center">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Patient Management</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Clinical Documentation</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>DOH Compliance</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mobile Access</span>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Recent Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm font-medium text-red-800">Critical Patient Alert</div>
                  <div className="text-xs text-red-600">Patient ID: 12847 requires immediate attention</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">Assessment Due</div>
                  <div className="text-xs text-yellow-600">5 patients have overdue assessments</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">System Update</div>
                  <div className="text-xs text-blue-600">DOH compliance module updated successfully</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>Reyada Homecare Platform - DOH Compliant Healthcare Management System</p>
          <p>Version 1.0.0 | UAE Ministry of Health and Prevention Approved</p>
        </div>
      </div>
    </div>
  );
}