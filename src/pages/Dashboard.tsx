import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Bell,
  User,
  Settings,
  Home,
  Users,
  FileText,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { SystemStatus } from "@/components/ui/system-status";
import {
  NotificationCenter,
  useNotifications,
} from "@/components/ui/notification-center";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import PatientManagement from "@/components/patient/PatientManagement";
import ClinicalDocumentation from "@/components/clinical/ClinicalDocumentation";
import AttendanceTracker from "@/components/administrative/AttendanceTracker";
import TimesheetManagement from "@/components/administrative/TimesheetManagement";
import DailyPlanningDashboard from "@/components/administrative/DailyPlanningDashboard";
import IncidentReportingDashboard from "@/components/administrative/IncidentReportingDashboard";
import ReportingDashboard from "@/components/administrative/ReportingDashboard";
import QualityAssuranceDashboard from "@/components/administrative/QualityAssuranceDashboard";
import CommunicationDashboard from "@/components/administrative/CommunicationDashboard";
import CommitteeManagement from "@/components/administrative/CommitteeManagement";
import EmailWorkflowManager from "@/components/administrative/EmailWorkflowManager";
import PlatformPatientChat from "@/components/administrative/PlatformPatientChat";
import GovernanceDocuments from "@/components/administrative/GovernanceDocuments";

const Dashboard = () => {
  const { toast } = useToastContext();
  const { handleSuccess } = useErrorHandler();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
  } = useNotifications();

  // Initialize with some sample notifications
  React.useEffect(() => {
    addNotification({
      title: "New Patient Registration",
      message: "Ahmed Al Mansouri has been registered for homecare services",
      type: "info",
      category: "Patient Management",
      priority: "medium",
    });

    addNotification({
      title: "Compliance Alert",
      message: "3 clinical forms require immediate attention",
      type: "warning",
      category: "Compliance",
      priority: "high",
    });

    addNotification({
      title: "System Update",
      message: "Platform maintenance scheduled for tonight at 2:00 AM",
      type: "info",
      category: "System",
      priority: "low",
    });
  }, []);

  // Mock data for dashboard
  const recentPatients = [
    {
      id: 1,
      name: "Ahmed Al Mansouri",
      emiratesId: "784-1985-1234567-1",
      insurance: "Daman Enhanced",
      status: "Active",
      lastVisit: "2023-06-15",
    },
    {
      id: 2,
      name: "Fatima Al Shamsi",
      emiratesId: "784-1990-7654321-2",
      insurance: "Thiqa",
      status: "Pending",
      lastVisit: "2023-06-12",
    },
    {
      id: 3,
      name: "Mohammed Al Hashimi",
      emiratesId: "784-1975-9876543-3",
      insurance: "Daman Basic",
      status: "Active",
      lastVisit: "2023-06-10",
    },
    {
      id: 4,
      name: "Aisha Al Zaabi",
      emiratesId: "784-1982-5432167-4",
      insurance: "MSC",
      status: "Completed",
      lastVisit: "2023-06-08",
    },
  ];

  const statistics = {
    totalPatients: 248,
    activeEpisodes: 156,
    pendingVisits: 42,
    complianceRate: 94,
    authorizationRate: 92,
    // Administrative statistics
    activeStaff: 45,
    pendingIncidents: 3,
    overdueActions: 7,
    qualityScore: 96,
    attendanceRate: 98,
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r p-4">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Reyada Homecare</h1>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Patients
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Clinical Forms
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduling
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <AlertCircle className="mr-2 h-4 w-4" />
            Compliance
          </Button>
        </nav>

        <div className="mt-auto pt-4">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <div className="flex items-center mt-4 p-2 rounded-md bg-muted">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Dr. Sarah Ahmed</p>
              <p className="text-xs text-muted-foreground">
                Clinical Supervisor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-4 justify-between">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-primary ml-2">Reyada</h1>
            </div>

            <div className="flex items-center w-full max-w-sm mx-4">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients, forms..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <SystemStatus />
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onClearAll={clearAll}
                onAction={(notification) => {
                  handleSuccess(
                    "Action Triggered",
                    `Opened: ${notification.title}`,
                  );
                }}
              />
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, Dr. Sarah. Here's an overview of your homecare
                  operations.
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline">Export</Button>
                <Button>New Patient</Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.totalPatients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Episodes
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.activeEpisodes}
                  </div>
                  <p className="text-xs text-muted-foreground">+8 this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Visits
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.pendingVisits}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For next 48 hours
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliance Rate
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.complianceRate}%
                  </div>
                  <Progress
                    value={statistics.complianceRate}
                    className="h-1 mt-2"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Authorization Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.authorizationRate}%
                  </div>
                  <Progress
                    value={statistics.authorizationRate}
                    className="h-1 mt-2"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quality Score
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.qualityScore}%
                  </div>
                  <Progress
                    value={statistics.qualityScore}
                    className="h-1 mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 md:w-auto md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-15">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="committees">Committees</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Recent Patients */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Patients</CardTitle>
                    <CardDescription>
                      Your recently accessed patients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-2">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
                              />
                              <AvatarFallback>
                                {patient.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.emiratesId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge
                              variant={
                                patient.status === "Active"
                                  ? "default"
                                  : patient.status === "Pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {patient.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="ml-2">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>DOH Compliance Summary</CardTitle>
                    <CardDescription>
                      Regulatory compliance status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            CN_13_2025 Emiratization
                          </span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-1" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            CN_19_2025 Patient Safety
                          </span>
                          <span className="text-sm font-medium">96%</span>
                        </div>
                        <Progress value={96} className="h-1" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            CN_48_2025 Documentation
                          </span>
                          <span className="text-sm font-medium">89%</span>
                        </div>
                        <Progress value={89} className="h-1" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            JAWDA KPI Reporting
                          </span>
                          <span className="text-sm font-medium">100%</span>
                        </div>
                        <Progress value={100} className="h-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="mt-4">
                <PatientManagement />
              </TabsContent>

              <TabsContent value="clinical" className="mt-4">
                <ClinicalDocumentation />
              </TabsContent>

              <TabsContent value="attendance" className="mt-4">
                <AttendanceTracker />
              </TabsContent>

              <TabsContent value="timesheets" className="mt-4">
                <TimesheetManagement />
              </TabsContent>

              <TabsContent value="planning" className="mt-4">
                <DailyPlanningDashboard />
              </TabsContent>

              <TabsContent value="incidents" className="mt-4">
                <IncidentReportingDashboard />
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <ReportingDashboard />
              </TabsContent>

              <TabsContent value="quality" className="mt-4">
                <QualityAssuranceDashboard />
              </TabsContent>

              <TabsContent value="compliance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>DOH Compliance Center</CardTitle>
                    <CardDescription>
                      Monitor and manage regulatory compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-8 text-center">
                      <h3 className="text-lg font-medium">Compliance Module</h3>
                      <p className="text-muted-foreground mt-2">
                        Detailed compliance monitoring and reporting tools will
                        be displayed here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication" className="mt-4">
                <CommunicationDashboard />
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <PlatformPatientChat />
              </TabsContent>

              <TabsContent value="email" className="mt-4">
                <EmailWorkflowManager />
              </TabsContent>

              <TabsContent value="committees" className="mt-4">
                <CommitteeManagement />
              </TabsContent>

              <TabsContent value="governance" className="mt-4">
                <GovernanceDocuments />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
