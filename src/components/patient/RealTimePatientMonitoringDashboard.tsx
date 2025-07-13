import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Heart, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Clock,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  Bell,
  Monitor
} from 'lucide-react';

export default function RealTimePatientMonitoringDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateMonitoringData();
      updateAlerts();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const updateMonitoringData = () => {
    setMonitoringData({
      totalPatients: 1247,
      activeMonitoring: 892,
      criticalAlerts: Math.floor(Math.random() * 5) + 1,
      warningAlerts: Math.floor(Math.random() * 15) + 5,
      stablePatients: 834,
      vitalsUpdated: Math.floor(Math.random() * 50) + 800,
      responseTime: Math.floor(Math.random() * 30) + 120, // 120-150ms
      systemUptime: 99.97,
      dataAccuracy: 99.2
    });
  };

  const updateAlerts = () => {
    const alertTypes = [
      { type: 'Critical', message: 'Patient vital signs abnormal - Room 204', priority: 'high', time: '2 min ago' },
      { type: 'Warning', message: 'Medication reminder overdue - Patient ID 1247', priority: 'medium', time: '5 min ago' },
      { type: 'Info', message: 'Scheduled assessment completed - Room 301', priority: 'low', time: '8 min ago' },
      { type: 'Critical', message: 'Fall risk alert triggered - Room 156', priority: 'high', time: '12 min ago' },
      { type: 'Warning', message: 'Blood pressure reading outside range', priority: 'medium', time: '15 min ago' }
    ];
    
    setAlerts(alertTypes.slice(0, Math.floor(Math.random() * 3) + 2));
  };

  const patientCategories = [
    {
      category: 'Critical Care',
      count: 23,
      status: 'High Priority',
      color: 'red',
      icon: AlertTriangle,
      metrics: {
        avgHeartRate: 95,
        avgBloodPressure: '145/92',
        oxygenSaturation: 94,
        temperature: 38.2
      }
    },
    {
      category: 'Post-Surgical',
      count: 156,
      status: 'Monitoring',
      color: 'orange',
      icon: Activity,
      metrics: {
        avgHeartRate: 78,
        avgBloodPressure: '128/82',
        oxygenSaturation: 97,
        temperature: 37.1
      }
    },
    {
      category: 'Chronic Care',
      count: 445,
      status: 'Stable',
      color: 'blue',
      icon: Heart,
      metrics: {
        avgHeartRate: 72,
        avgBloodPressure: '122/78',
        oxygenSaturation: 98,
        temperature: 36.8
      }
    },
    {
      category: 'Recovery',
      count: 268,
      status: 'Improving',
      color: 'green',
      icon: TrendingUp,
      metrics: {
        avgHeartRate: 68,
        avgBloodPressure: '118/75',
        oxygenSaturation: 99,
        temperature: 36.6
      }
    }
  ];

  const vitalSignsData = [
    { name: 'Heart Rate', value: 75, unit: 'bpm', status: 'Normal', trend: 'stable' },
    { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'Normal', trend: 'stable' },
    { name: 'Oxygen Saturation', value: 98, unit: '%', status: 'Normal', trend: 'up' },
    { name: 'Temperature', value: 36.7, unit: '°C', status: 'Normal', trend: 'stable' },
    { name: 'Respiratory Rate', value: 16, unit: '/min', status: 'Normal', trend: 'stable' },
    { name: 'Pain Level', value: 2, unit: '/10', status: 'Low', trend: 'down' }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'High Priority': return 'bg-red-100 text-red-800 border-red-200';
      case 'Monitoring': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Stable': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Improving': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Monitor className="h-12 w-12 text-green-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              REAL-TIME MONITORING
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">Patient Monitoring Dashboard</h2>
          <p className="text-lg text-gray-600">24/7 real-time patient monitoring and alert system</p>
          <div className="text-sm text-gray-500">
            Live Data: {currentTime.toLocaleString()}
          </div>
        </div>

        {/* System Status */}
        <Alert className="border-2 border-green-200 bg-green-50">
          <Activity className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">MONITORING SYSTEM STATUS - OPERATIONAL</AlertTitle>
          <AlertDescription className="mt-4 text-green-700">
            {monitoringData && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="mb-2"><strong>Total Patients:</strong> {monitoringData.totalPatients.toLocaleString()}</p>
                    <p className="mb-2"><strong>Active Monitoring:</strong> {monitoringData.activeMonitoring}</p>
                    <p><strong>Stable Patients:</strong> {monitoringData.stablePatients}</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Critical Alerts:</strong> {monitoringData.criticalAlerts}</p>
                    <p className="mb-2"><strong>Warning Alerts:</strong> {monitoringData.warningAlerts}</p>
                    <p><strong>Response Time:</strong> {monitoringData.responseTime}ms</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>System Uptime:</strong> {monitoringData.systemUptime}%</p>
                    <p className="mb-2"><strong>Data Accuracy:</strong> {monitoringData.dataAccuracy}%</p>
                    <p><strong>Vitals Updated:</strong> {monitoringData.vitalsUpdated}</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Status:</strong> Operational</p>
                    <p className="mb-2"><strong>Coverage:</strong> 24/7</p>
                    <p><strong>Backup Systems:</strong> Active</p>
                  </div>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>

        {/* Real-time Alerts */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <Bell className="h-6 w-6" />
              <span>Real-time Alerts</span>
            </CardTitle>
            <CardDescription>Live patient alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge className={getAlertColor(alert.priority)}>
                      {alert.type}
                    </Badge>
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {alert.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {patientCategories.map((category, index) => (
            <Card key={index} className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`w-8 h-8 bg-${category.color}-100 rounded-full flex items-center justify-center`}>
                      <category.icon className={`h-4 w-4 text-${category.color}-600`} />
                    </div>
                    <span className="text-lg">{category.category}</span>
                  </CardTitle>
                  <Badge className={getStatusColor(category.status)}>
                    {category.status}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {category.count}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Heart Rate:</span>
                    <span className="font-medium">{category.metrics.avgHeartRate} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blood Pressure:</span>
                    <span className="font-medium">{category.metrics.avgBloodPressure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>O2 Saturation:</span>
                    <span className="font-medium">{category.metrics.oxygenSaturation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-medium">{category.metrics.temperature}°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vital Signs Overview */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Activity className="h-6 w-6" />
              <span>Average Vital Signs</span>
            </CardTitle>
            <CardDescription>Real-time vital signs monitoring across all patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vitalSignsData.map((vital, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-800">{vital.name}</span>
                    <div className="flex items-center space-x-1">
                      {vital.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {vital.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                      {vital.trend === 'stable' && <div className="h-3 w-3 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {vital.value} {vital.unit}
                  </div>
                  <Badge className={vital.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {vital.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Controls */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Shield className="h-6 w-6" />
              <span>Monitoring Controls</span>
            </CardTitle>
            <CardDescription>Configure and manage patient monitoring settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Enable All Monitoring
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700">
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-semibold text-lg">📊 Real-time Patient Monitoring Dashboard 📊</p>
          <p>Active Monitoring: {monitoringData?.activeMonitoring || 0} | Alerts: {monitoringData?.criticalAlerts || 0} Critical | Uptime: {monitoringData?.systemUptime || 0}%</p>
        </div>
      </div>
    </div>
  );
}