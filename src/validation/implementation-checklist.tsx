import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Shield,
  Smartphone,
  Database,
  Users,
  Calendar,
  MessageSquare,
  Lock,
  Search,
  Stethoscope,
  UserCheck,
} from "lucide-react";

interface ImplementationItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "partial" | "not-started";
  priority: "high" | "medium" | "low";
  category: string;
  icon: React.ReactNode;
  details: string[];
  recommendations?: string[];
}

const ImplementationValidationChecklist: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const implementationItems: ImplementationItem[] = [
    {
      id: "emirates-id",
      title: "Emirates ID Integration and Validation",
      description:
        "OCR scanning, format validation, and government database verification",
      status: "completed",
      priority: "high",
      category: "Identity Management",
      icon: <UserCheck className="h-5 w-5" />,
      details: [
        "OCR scanning with camera and file upload support",
        "Format validation (784-YYYY-XXXXXXX-X pattern)",
        "Checksum validation using Luhn algorithm",
        "Government database verification",
        "Duplicate checking with audit trails",
        "Comprehensive error handling and logging",
      ],
    },
    {
      id: "malaffi-emr",
      title: "Malaffi EMR Bidirectional Synchronization",
      description: "Complete integration with UAE national EMR system",
      status: "completed",
      priority: "high",
      category: "EMR Integration",
      icon: <Database className="h-5 w-5" />,
      details: [
        "Patient search and retrieval from Malaffi",
        "Medical records synchronization",
        "Bidirectional data sync with conflict resolution",
        "Authentication and session management",
        "Comprehensive error handling and retry logic",
        "Real-time sync status monitoring",
      ],
    },
    {
      id: "patient-portal",
      title: "Patient Portal Development and Functionality",
      description:
        "Comprehensive patient dashboard with health management features",
      status: "completed",
      priority: "high",
      category: "Patient Experience",
      icon: <Users className="h-5 w-5" />,
      details: [
        "Interactive health metrics dashboard",
        "Appointment management and scheduling",
        "Care plan visualization and tracking",
        "Secure messaging with healthcare providers",
        "Notification management and preferences",
        "Health trend analysis and reporting",
        "Family access controls and permissions",
      ],
    },
    {
      id: "mobile-app",
      title: "Mobile App Patient Access and Family Engagement",
      description: "Native mobile application for patients and families",
      status: "partial",
      priority: "high",
      category: "Mobile Experience",
      icon: <Smartphone className="h-5 w-5" />,
      details: [
        "Web-responsive design implemented",
        "Mobile-optimized user interface",
        "Touch-friendly navigation",
      ],
      recommendations: [
        "Implement React Native or Progressive Web App (PWA)",
        "Add native push notification infrastructure",
        "Implement offline synchronization for mobile",
        "Add mobile-specific UI optimizations",
        "Integrate biometric authentication for mobile",
      ],
    },
    {
      id: "appointment-scheduling",
      title: "Automated Appointment Scheduling and Reminders",
      description: "Intelligent scheduling system with automated reminders",
      status: "completed",
      priority: "medium",
      category: "Scheduling",
      icon: <Calendar className="h-5 w-5" />,
      details: [
        "Available slot fetching and management",
        "Appointment booking and cancellation",
        "Rescheduling functionality",
        "Provider-based filtering and search",
        "Automated reminder system",
        "Integration with calendar systems",
      ],
    },
    {
      id: "clinical-documentation",
      title: "Clinical Documentation Integration and Completeness",
      description:
        "Comprehensive clinical documentation and workflow management",
      status: "partial",
      priority: "high",
      category: "Clinical Workflow",
      icon: <Stethoscope className="h-5 w-5" />,
      details: [
        "Basic clinical documentation structure",
        "Patient assessment forms",
        "Clinical data entry interfaces",
      ],
      recommendations: [
        "Complete clinical forms integration",
        "Add electronic signature capture",
        "Implement clinical workflow automation",
        "Enhance integration with existing EMR systems",
        "Add clinical decision support tools",
      ],
    },
    {
      id: "patient-communication",
      title: "Patient Communication Preferences and Multi-channel Messaging",
      description: "Secure multi-channel communication system",
      status: "completed",
      priority: "medium",
      category: "Communication",
      icon: <MessageSquare className="h-5 w-5" />,
      details: [
        "Secure messaging with end-to-end encryption",
        "Multi-channel notifications (email, SMS, push)",
        "Conversation management and threading",
        "Message attachments and file sharing",
        "Notification preferences and controls",
        "Real-time message delivery status",
      ],
    },
    {
      id: "privacy-controls",
      title: "Privacy Controls and Consent Management",
      description: "Comprehensive privacy and consent management system",
      status: "completed",
      priority: "high",
      category: "Privacy & Compliance",
      icon: <Shield className="h-5 w-5" />,
      details: [
        "Granular privacy controls and settings",
        "Consent tracking and management",
        "Data access permissions and audit trails",
        "Family access controls and delegation",
        "GDPR and UAE Data Protection compliance",
        "Right to erasure and data portability",
      ],
    },
    {
      id: "data-encryption",
      title: "Data Encryption and Security for Patient Information",
      description: "Advanced encryption and security measures",
      status: "completed",
      priority: "high",
      category: "Security",
      icon: <Lock className="h-5 w-5" />,
      details: [
        "AES-256-GCM encryption at rest",
        "TLS 1.3 for data in transit",
        "Quantum-resistant cryptography implementation",
        "Advanced key management and rotation",
        "Input sanitization and validation",
        "Comprehensive security audit logging",
        "Multi-factor authentication (MFA)",
      ],
    },
    {
      id: "patient-search",
      title: "Patient Search and Filtering Capabilities with Advanced Criteria",
      description:
        "Advanced search and filtering system for patient management",
      status: "completed",
      priority: "medium",
      category: "Search & Analytics",
      icon: <Search className="h-5 w-5" />,
      details: [
        "Multi-criteria search (name, Emirates ID, status)",
        "Advanced filtering by lifecycle status",
        "Insurance status and provider filtering",
        "Risk level categorization and filtering",
        "Complexity scoring and analysis",
        "Real-time search with auto-suggestions",
        "Export and reporting capabilities",
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "not-started":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case "not-started":
        return <Badge className="bg-red-100 text-red-800">Not Started</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(implementationItems.map((item) => item.category))),
  ];
  const filteredItems =
    selectedCategory === "all"
      ? implementationItems
      : implementationItems.filter(
          (item) => item.category === selectedCategory,
        );

  const completedCount = implementationItems.filter(
    (item) => item.status === "completed",
  ).length;
  const partialCount = implementationItems.filter(
    (item) => item.status === "partial",
  ).length;
  const totalCount = implementationItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Technical Implementation Validation
        </h1>
        <p className="text-gray-600">
          Comprehensive validation of the Reyada Homecare Digital Transformation
          platform features
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overall Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {completionPercentage}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partial</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {partialCount}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Features
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All Categories" : category}
          </Button>
        ))}
      </div>

      {/* Implementation Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{item.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  {getStatusBadge(item.status)}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(item.priority)}
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedItem(expandedItem === item.id ? null : item.id)
                  }
                >
                  {expandedItem === item.id ? "Hide Details" : "Show Details"}
                </Button>
              </div>
            </CardHeader>

            {expandedItem === item.id && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Implementation Details:
                    </h4>
                    <ul className="space-y-1">
                      {item.details.map((detail, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.recommendations && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Recommendations for Enhancement:
                      </h4>
                      <ul className="space-y-1">
                        {item.recommendations.map((recommendation, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm text-amber-700"
                          >
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Strengths:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>
                  • Comprehensive security implementation with AES-256
                  encryption
                </li>
                <li>
                  • Full Emirates ID integration with government verification
                </li>
                <li>• Complete Malaffi EMR bidirectional synchronization</li>
                <li>• Robust patient portal with advanced features</li>
                <li>• Strong compliance with DOH and UAE regulations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Areas for Enhancement:
              </h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Native mobile app development (React Native/PWA)</li>
                <li>• Enhanced clinical documentation workflows</li>
                <li>• Advanced analytics and reporting capabilities</li>
                <li>• Integration with additional healthcare systems</li>
                <li>• Biometric authentication for mobile devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationValidationChecklist;
