import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Database,
  Smartphone,
} from "lucide-react";
import { MFASetup } from "@/components/security/MFAProvider";
import AdvancedDashboard from "@/components/analytics/AdvancedDashboard";
import { ValidatedInput } from "@/components/ui/form-validation";
import { useToastContext } from "@/components/ui/toast-provider";
import { useRealTimeSync } from "@/services/real-time-sync.service";
import { useErrorHandler } from "@/services/error-handler.service";

const CriticalFixesStoryboard = () => {
  const { toast } = useToastContext();
  const { isConnected, pendingEvents } = useRealTimeSync("demo");
  const { handleSuccess, handleApiError } = useErrorHandler();
  const [activeDemo, setActiveDemo] = React.useState("overview");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    emiratesId: "",
  });

  const handleTestToast = (
    variant: "success" | "destructive" | "warning" | "info",
  ) => {
    toast({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Test`,
      description: `This is a test ${variant} notification`,
      variant,
    });
  };

  const handleTestError = () => {
    try {
      throw new Error("This is a test error for demonstration");
    } catch (error) {
      handleApiError(error, "Demo Test");
    }
  };

  const handleTestSuccess = () => {
    handleSuccess("Operation Successful", "This is a test success message");
  };

  const criticalFixes = [
    {
      title: "Standardized Toast System",
      description: "Unified toast notifications across all components",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Implemented centralized toast provider with consistent styling and behavior",
    },
    {
      title: "Enhanced Error Handling",
      description: "Centralized error handling service with logging",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Created error handler service with API error management and user feedback",
    },
    {
      title: "Form Validation System",
      description: "Comprehensive form validation with real-time feedback",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Built validated input components with UAE-specific validation rules",
    },
    {
      title: "Real-Time Data Sync",
      description: "WebSocket-based real-time synchronization service",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Implemented real-time sync with automatic reconnection and event queuing",
    },
    {
      title: "Multi-Factor Authentication",
      description: "Complete MFA system with multiple authentication methods",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Built MFA provider with SMS, email, authenticator app, and backup codes",
    },
    {
      title: "Advanced Analytics Dashboard",
      description: "AI-powered insights and predictive analytics",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      details:
        "Created advanced dashboard with real-time metrics and AI insights",
    },
  ];

  const enhancements = [
    {
      title: "Workflow Automation",
      description: "Automated business process workflows",
      status: "in-progress",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
    },
    {
      title: "Mobile App Development",
      description: "Native mobile applications for iOS and Android",
      status: "planned",
      icon: <Smartphone className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "AI-Powered Insights",
      description: "Machine learning models for predictive analytics",
      status: "in-progress",
      icon: <Database className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Critical Fixes & Enhancements Implementation
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Comprehensive solutions for identified gaps, errors, and enhancement
            opportunities
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />6 Critical Fixes Completed
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Database className="h-4 w-4 mr-2" />
              Real-Time Sync: {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Enhanced Security Active
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            {[
              { id: "overview", label: "Overview" },
              { id: "toast", label: "Toast System" },
              { id: "validation", label: "Form Validation" },
              { id: "mfa", label: "MFA Setup" },
              { id: "analytics", label: "Advanced Analytics" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeDemo === tab.id ? "default" : "ghost"}
                onClick={() => setActiveDemo(tab.id)}
                className="px-4 py-2"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeDemo === "overview" && (
          <div className="space-y-8">
            {/* Critical Fixes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Critical Fixes Implemented
                </CardTitle>
                <CardDescription>
                  All critical gaps and errors have been addressed with robust
                  solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criticalFixes.map((fix, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {fix.icon}
                          <CardTitle className="text-sm">{fix.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">
                          {fix.description}
                        </p>
                        <p className="text-xs text-gray-500">{fix.details}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhancement Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  Enhancement Opportunities
                </CardTitle>
                <CardDescription>
                  Additional improvements for platform optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enhancements.map((enhancement, index) => (
                    <Card
                      key={index}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {enhancement.icon}
                          <CardTitle className="text-sm">
                            {enhancement.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">
                          {enhancement.description}
                        </p>
                        <Badge
                          variant={
                            enhancement.status === "completed"
                              ? "default"
                              : enhancement.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {enhancement.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toast System Demo */}
        {activeDemo === "toast" && (
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Toast Notification System</CardTitle>
              <CardDescription>
                Standardized toast notifications with consistent styling and
                behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => handleTestToast("success")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Success Toast
                  </Button>
                  <Button
                    onClick={() => handleTestToast("destructive")}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Error Toast
                  </Button>
                  <Button
                    onClick={() => handleTestToast("warning")}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Warning Toast
                  </Button>
                  <Button
                    onClick={() => handleTestToast("info")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Info Toast
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button onClick={handleTestError} variant="outline">
                    Test Error Handler
                  </Button>
                  <Button onClick={handleTestSuccess} variant="outline">
                    Test Success Handler
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Consistent styling across all components</li>
                    <li>• Auto-dismiss with configurable duration</li>
                    <li>• Multiple variants (success, error, warning, info)</li>
                    <li>• Centralized error handling integration</li>
                    <li>• Accessibility compliant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Validation Demo */}
        {activeDemo === "validation" && (
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Form Validation System</CardTitle>
              <CardDescription>
                Real-time validation with UAE-specific rules and visual feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ValidatedInput
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    rules={{ required: true, minLength: 2 }}
                    placeholder="Enter your full name"
                  />

                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    rules={{ required: true, email: true }}
                    placeholder="Enter your email"
                  />

                  <ValidatedInput
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    rules={{ required: true, phone: true }}
                    placeholder="Enter UAE phone number"
                  />

                  <ValidatedInput
                    label="Emirates ID"
                    value={formData.emiratesId}
                    onChange={(e) =>
                      setFormData({ ...formData, emiratesId: e.target.value })
                    }
                    rules={{ required: true, emiratesId: true }}
                    placeholder="784-YYYY-NNNNNNN-N"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Validation Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time validation feedback</li>
                    <li>• UAE-specific validation rules</li>
                    <li>• Emirates ID format validation</li>
                    <li>• Phone number format validation</li>
                    <li>• Email format validation</li>
                    <li>• Visual success/error indicators</li>
                    <li>• Custom validation rules support</li>
                    <li>• Accessibility compliant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MFA Setup Demo */}
        {activeDemo === "mfa" && (
          <div>
            <MFASetup />
          </div>
        )}

        {/* Advanced Analytics Demo */}
        {activeDemo === "analytics" && (
          <div>
            <AdvancedDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default CriticalFixesStoryboard;
