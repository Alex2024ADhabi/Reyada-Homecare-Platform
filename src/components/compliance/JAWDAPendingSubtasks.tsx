import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  FileText,
  Users,
  Database,
  Shield,
  Activity,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PendingSubtask {
  id: string;
  category: "implementation" | "enhancement" | "maintenance" | "compliance";
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "blocked" | "completed";
  estimated_effort: string;
  responsible_team: string;
  dependencies: string[];
  acceptance_criteria: string[];
  business_value: string;
  technical_requirements: string[];
  timeline: string;
}

interface JAWDAPendingSubtasksProps {
  showHeader?: boolean;
}

export default function JAWDAPendingSubtasks({
  showHeader = true,
}: JAWDAPendingSubtasksProps) {
  const [pendingSubtasks, setPendingSubtasks] = useState<PendingSubtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    loadPendingSubtasks();
  }, []);

  const loadPendingSubtasks = async () => {
    try {
      setLoading(true);

      // Based on analysis of JAWDA guidelines and current implementation
      const mockPendingSubtasks: PendingSubtask[] = [
        {
          id: "SUBTASK-001",
          category: "enhancement",
          title: "Advanced Analytics Dashboard for JAWDA KPIs",
          description:
            "Develop predictive analytics and trend analysis capabilities for JAWDA KPI performance with machine learning insights",
          priority: "medium",
          status: "pending",
          estimated_effort: "3-4 weeks",
          responsible_team: "Data Analytics Team, Development Team",
          dependencies: [
            "Current KPI data collection system",
            "Historical data availability",
          ],
          acceptance_criteria: [
            "Predictive models for each KPI indicator",
            "Trend analysis with forecasting",
            "Automated alerts for performance degradation",
            "Executive dashboard with insights",
          ],
          business_value:
            "Enhanced decision-making capabilities and proactive quality management",
          technical_requirements: [
            "Machine learning model development",
            "Advanced visualization components",
            "Real-time data processing pipeline",
            "Integration with existing dashboard",
          ],
          timeline: "Q1 2025",
        },
        {
          id: "SUBTASK-002",
          category: "enhancement",
          title: "Mobile Application for JAWDA Data Collection",
          description:
            "Develop mobile application for field staff to collect JAWDA-related data with offline capabilities",
          priority: "medium",
          status: "pending",
          estimated_effort: "6-8 weeks",
          responsible_team: "Mobile Development Team, UX/UI Team",
          dependencies: [
            "API endpoints for data submission",
            "Authentication system",
          ],
          acceptance_criteria: [
            "Native mobile app for iOS and Android",
            "Offline data collection capabilities",
            "Automatic sync when online",
            "Role-based access control",
            "Digital signature support",
          ],
          business_value:
            "Improved data collection efficiency and real-time field data capture",
          technical_requirements: [
            "React Native or Flutter development",
            "Offline storage implementation",
            "Sync mechanism development",
            "Mobile authentication integration",
          ],
          timeline: "Q2 2025",
        },
        {
          id: "SUBTASK-003",
          category: "enhancement",
          title: "Integration with External Healthcare Systems",
          description:
            "Develop API integrations with external healthcare systems for seamless data exchange and interoperability",
          priority: "low",
          status: "pending",
          estimated_effort: "4-6 weeks",
          responsible_team: "Integration Team, API Development Team",
          dependencies: [
            "External system API documentation",
            "Data mapping requirements",
          ],
          acceptance_criteria: [
            "HL7 FHIR compliance",
            "Secure data exchange protocols",
            "Real-time data synchronization",
            "Error handling and retry mechanisms",
          ],
          business_value:
            "Enhanced interoperability and reduced manual data entry across systems",
          technical_requirements: [
            "HL7 FHIR implementation",
            "API gateway configuration",
            "Data transformation services",
            "Security compliance implementation",
          ],
          timeline: "Q3 2025",
        },
        {
          id: "SUBTASK-004",
          category: "maintenance",
          title: "Performance Optimization for Large Datasets",
          description:
            "Optimize system performance for handling large volumes of JAWDA data with improved query performance",
          priority: "medium",
          status: "pending",
          estimated_effort: "2-3 weeks",
          responsible_team: "Backend Development Team, Database Team",
          dependencies: [
            "Performance baseline establishment",
            "Database optimization analysis",
          ],
          acceptance_criteria: [
            "50% improvement in query response times",
            "Optimized database indexing",
            "Efficient data archiving strategy",
            "Load testing validation",
          ],
          business_value: "Improved system responsiveness and user experience",
          technical_requirements: [
            "Database query optimization",
            "Indexing strategy implementation",
            "Caching mechanism enhancement",
            "Performance monitoring tools",
          ],
          timeline: "Q1 2025",
        },
        {
          id: "SUBTASK-005",
          category: "enhancement",
          title: "Advanced Reporting and Export Capabilities",
          description:
            "Develop advanced reporting features with custom report builder and multiple export formats",
          priority: "medium",
          status: "pending",
          estimated_effort: "3-4 weeks",
          responsible_team: "Frontend Development Team, Reporting Team",
          dependencies: [
            "Report template requirements",
            "Export format specifications",
          ],
          acceptance_criteria: [
            "Custom report builder interface",
            "Multiple export formats (PDF, Excel, CSV)",
            "Scheduled report generation",
            "Report sharing capabilities",
          ],
          business_value:
            "Enhanced reporting flexibility and stakeholder communication",
          technical_requirements: [
            "Report builder component development",
            "Export library integration",
            "Scheduling service implementation",
            "Email notification system",
          ],
          timeline: "Q2 2025",
        },
        {
          id: "SUBTASK-006",
          category: "compliance",
          title: "Automated Compliance Audit Trail",
          description:
            "Implement comprehensive audit trail system for all JAWDA-related activities with automated compliance reporting",
          priority: "high",
          status: "pending",
          estimated_effort: "2-3 weeks",
          responsible_team: "Security Team, Compliance Team",
          dependencies: [
            "Audit requirements specification",
            "Compliance framework definition",
          ],
          acceptance_criteria: [
            "Complete activity logging",
            "Immutable audit records",
            "Automated compliance reports",
            "Role-based audit access",
          ],
          business_value:
            "Enhanced compliance monitoring and regulatory readiness",
          technical_requirements: [
            "Audit logging framework",
            "Immutable storage implementation",
            "Automated report generation",
            "Access control implementation",
          ],
          timeline: "Q1 2025",
        },
        {
          id: "SUBTASK-007",
          category: "enhancement",
          title: "AI-Powered Quality Insights",
          description:
            "Implement AI-powered analysis for quality insights and recommendations based on JAWDA KPI patterns",
          priority: "low",
          status: "pending",
          estimated_effort: "6-8 weeks",
          responsible_team: "AI/ML Team, Data Science Team",
          dependencies: ["Historical data analysis", "AI model training data"],
          acceptance_criteria: [
            "Pattern recognition algorithms",
            "Automated quality recommendations",
            "Anomaly detection system",
            "Natural language insights",
          ],
          business_value:
            "Proactive quality management and intelligent decision support",
          technical_requirements: [
            "Machine learning model development",
            "Natural language processing",
            "Anomaly detection algorithms",
            "Recommendation engine",
          ],
          timeline: "Q3 2025",
        },
        {
          id: "SUBTASK-008",
          category: "maintenance",
          title: "Security Enhancement and Penetration Testing",
          description:
            "Conduct comprehensive security assessment and implement enhanced security measures for JAWDA system",
          priority: "high",
          status: "pending",
          estimated_effort: "3-4 weeks",
          responsible_team: "Security Team, External Security Consultants",
          dependencies: [
            "Security assessment scope",
            "Penetration testing schedule",
          ],
          acceptance_criteria: [
            "Complete security assessment report",
            "Vulnerability remediation",
            "Enhanced encryption implementation",
            "Security monitoring enhancement",
          ],
          business_value: "Enhanced data security and regulatory compliance",
          technical_requirements: [
            "Security assessment tools",
            "Vulnerability scanning",
            "Encryption enhancement",
            "Security monitoring tools",
          ],
          timeline: "Q1 2025",
        },
        {
          id: "SUBTASK-009",
          category: "enhancement",
          title: "Multi-language Support for International Standards",
          description:
            "Implement multi-language support for JAWDA interface to support international healthcare standards",
          priority: "low",
          status: "pending",
          estimated_effort: "4-5 weeks",
          responsible_team: "Frontend Development Team, Localization Team",
          dependencies: ["Translation requirements", "Localization framework"],
          acceptance_criteria: [
            "Arabic and English language support",
            "RTL (Right-to-Left) layout support",
            "Localized date and number formats",
            "Cultural adaptation of UI elements",
          ],
          business_value: "Enhanced accessibility and international compliance",
          technical_requirements: [
            "Internationalization framework",
            "RTL layout implementation",
            "Translation management system",
            "Locale-specific formatting",
          ],
          timeline: "Q4 2025",
        },
        {
          id: "SUBTASK-010",
          category: "maintenance",
          title: "Automated Testing and Quality Assurance Enhancement",
          description:
            "Implement comprehensive automated testing suite for JAWDA system with continuous quality assurance",
          priority: "medium",
          status: "pending",
          estimated_effort: "3-4 weeks",
          responsible_team: "QA Team, Development Team",
          dependencies: [
            "Testing framework selection",
            "Test case documentation",
          ],
          acceptance_criteria: [
            "Unit test coverage >90%",
            "Integration test automation",
            "End-to-end test scenarios",
            "Continuous integration pipeline",
          ],
          business_value:
            "Improved system reliability and reduced regression issues",
          technical_requirements: [
            "Testing framework implementation",
            "Test automation tools",
            "CI/CD pipeline enhancement",
            "Quality metrics dashboard",
          ],
          timeline: "Q2 2025",
        },
      ];

      setPendingSubtasks(mockPendingSubtasks);
    } catch (error) {
      console.error("Error loading pending subtasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      blocked: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: "bg-red-200 text-red-900 border-red-300",
      high: "bg-orange-200 text-orange-900 border-orange-300",
      medium: "bg-yellow-200 text-yellow-900 border-yellow-300",
      low: "bg-green-200 text-green-900 border-green-300",
    };
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "implementation":
        return <Target className="w-4 h-4" />;
      case "enhancement":
        return <Activity className="w-4 h-4" />;
      case "maintenance":
        return <Shield className="w-4 h-4" />;
      case "compliance":
        return <FileText className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const filteredSubtasks = pendingSubtasks.filter((subtask) => {
    const matchesCategory =
      filterCategory === "all" || subtask.category === filterCategory;
    const matchesPriority =
      filterPriority === "all" || subtask.priority === filterPriority;
    return matchesCategory && matchesPriority;
  });

  const priorityCounts = pendingSubtasks.reduce(
    (acc, subtask) => {
      acc[subtask.priority] = (acc[subtask.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categoryCounts = pendingSubtasks.reduce(
    (acc, subtask) => {
      acc[subtask.category] = (acc[subtask.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                JAWDA Pending Subtasks
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive list of pending enhancement and maintenance tasks
                for JAWDA implementation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="implementation">Implementation</option>
                <option value="enhancement">Enhancement</option>
                <option value="maintenance">Maintenance</option>
                <option value="compliance">Compliance</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button
                onClick={loadPendingSubtasks}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total Subtasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {pendingSubtasks.length}
              </div>
              <p className="text-xs text-blue-600">Pending implementation</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {(priorityCounts.critical || 0) + (priorityCounts.high || 0)}
              </div>
              <p className="text-xs text-orange-600">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {categoryCounts.enhancement || 0}
              </div>
              <p className="text-xs text-green-600">Feature improvements</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {categoryCounts.maintenance || 0}
              </div>
              <p className="text-xs text-purple-600">System maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            JAWDA Implementation Status
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            All critical JAWDA requirements have been successfully implemented.
            The subtasks listed below are enhancements and maintenance items
            that will further improve the system's capabilities and performance.
          </AlertDescription>
        </Alert>

        {/* Subtasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Subtasks Details</CardTitle>
            <CardDescription>
              Comprehensive list of all pending subtasks with implementation
              details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Effort</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Responsible Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubtasks.map((subtask) => (
                    <TableRow key={subtask.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(subtask.category)}
                          <Badge variant="outline">
                            {subtask.category.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {subtask.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {subtask.description.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(subtask.priority)}
                      </TableCell>
                      <TableCell>{getStatusBadge(subtask.status)}</TableCell>
                      <TableCell className="text-sm">
                        {subtask.estimated_effort}
                      </TableCell>
                      <TableCell className="text-sm">
                        {subtask.timeline}
                      </TableCell>
                      <TableCell className="text-sm">
                        {subtask.responsible_team}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Subtasks */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Detailed Subtask Information
          </h2>
          {filteredSubtasks.map((subtask) => (
            <Card key={subtask.id} className="border-l-4 border-l-blue-400">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(subtask.category)}
                      <h4 className="font-semibold text-lg">{subtask.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {subtask.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span>
                        Category: {subtask.category.replace("_", " ")}
                      </span>
                      <span>Effort: {subtask.estimated_effort}</span>
                      <span>Timeline: {subtask.timeline}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(subtask.status)}
                    {getPriorityBadge(subtask.priority)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium mb-2">Acceptance Criteria:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {subtask.acceptance_criteria.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">
                      Technical Requirements:
                    </h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {subtask.technical_requirements.map(
                        (requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium mb-1 text-blue-800">
                      Business Value:
                    </h5>
                    <p className="text-sm text-blue-700">
                      {subtask.business_value}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-1 text-gray-800">
                      Responsible Team:
                    </h5>
                    <p className="text-sm text-gray-700">
                      {subtask.responsible_team}
                    </p>
                    {subtask.dependencies.length > 0 && (
                      <div className="mt-2">
                        <h6 className="font-medium text-xs text-gray-600">
                          Dependencies:
                        </h6>
                        <ul className="text-xs text-gray-600 mt-1">
                          {subtask.dependencies.map((dep, index) => (
                            <li key={index}>• {dep}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
