import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Plus,
  Edit,
  Send,
  Eye,
  Trash2,
  Copy,
  Settings,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import websocketService from "@/services/websocket.service";

interface EmailTemplate {
  _id: string;
  template_id: string;
  template_name: string;
  template_category: string;
  subject_template: string;
  body_template: string;
  template_variables: Array<{
    variable_name: string;
    variable_type: string;
    required: boolean;
    description: string;
  }>;
  workflow_triggers: Array<{
    trigger_type: string;
    auto_send: boolean;
    approval_required: boolean;
  }>;
  template_settings: {
    allow_customization: boolean;
    require_approval: boolean;
    track_opens: boolean;
    track_clicks: boolean;
    priority: string;
  };
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface EmailCommunication {
  _id: string;
  communication_id: string;
  template_id: string;
  template_name: string;
  sender: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
  recipients: Array<{
    recipient_type: string;
    name: string;
    email: string;
    patient_id?: string;
    relationship?: string;
    role?: string;
  }>;
  subject: string;
  body: string;
  priority: string;
  status: string;
  sent_at: string;
  delivery_status: {
    delivered: number;
    failed: number;
    pending: number;
  };
  tracking: {
    opened: boolean;
    open_count: number;
    first_opened_at?: string;
    last_opened_at?: string;
    clicked: boolean;
    click_count: number;
  };
  workflow_context: {
    trigger_type: string;
    patient_id?: string;
    care_plan_id?: string;
  };
  created_at: string;
  updated_at: string;
}

const EmailWorkflowManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [communications, setCommunications] = useState<EmailCommunication[]>(
    [],
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    template_name: "",
    template_category: "patient_communication",
    subject_template: "",
    body_template: "",
    template_variables: [] as any[],
    workflow_triggers: [] as any[],
    template_settings: {
      allow_customization: true,
      require_approval: false,
      track_opens: true,
      track_clicks: true,
      priority: "normal",
    },
  });

  // Send Email Form State
  const [sendForm, setSendForm] = useState({
    template_id: "",
    recipients: [] as any[],
    subject: "",
    body: "",
    priority: "normal",
    variables: {} as any,
  });

  useEffect(() => {
    loadTemplates();
    loadCommunications();

    // Subscribe to email notifications
    const unsubscribe = websocketService.subscribe(
      "email_notifications",
      (data) => {
        console.log("Received email notification:", data);
        loadCommunications();
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templateData = await communicationAPI.email.getEmailTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunications = async () => {
    try {
      const commData = await communicationAPI.email.getEmailCommunications();
      setCommunications(commData);
    } catch (error) {
      console.error("Error loading communications:", error);
    }
  };

  const createTemplate = async () => {
    try {
      await communicationAPI.email.createEmailTemplate({
        ...templateForm,
        created_by: "Dr. Sarah Ahmed",
      });
      setShowTemplateDialog(false);
      resetTemplateForm();
      loadTemplates();
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const sendEmail = async () => {
    try {
      const emailData = {
        ...sendForm,
        sender: {
          user_id: "EMP001",
          name: "Dr. Sarah Ahmed",
          email: "sarah.ahmed@reyada.ae",
          role: "Head Nurse",
        },
        workflow_context: {
          trigger_type: "manual_send",
        },
      };

      await communicationAPI.email.sendEmail(emailData);
      setShowSendDialog(false);
      resetSendForm();
      loadCommunications();
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      template_name: "",
      template_category: "patient_communication",
      subject_template: "",
      body_template: "",
      template_variables: [],
      workflow_triggers: [],
      template_settings: {
        allow_customization: true,
        require_approval: false,
        track_opens: true,
        track_clicks: true,
        priority: "normal",
      },
    });
  };

  const resetSendForm = () => {
    setSendForm({
      template_id: "",
      recipients: [],
      subject: "",
      body: "",
      priority: "normal",
      variables: {},
    });
  };

  const addVariable = () => {
    setTemplateForm({
      ...templateForm,
      template_variables: [
        ...templateForm.template_variables,
        {
          variable_name: "",
          variable_type: "text",
          required: false,
          description: "",
        },
      ],
    });
  };

  const removeVariable = (index: number) => {
    const newVariables = templateForm.template_variables.filter(
      (_, i) => i !== index,
    );
    setTemplateForm({ ...templateForm, template_variables: newVariables });
  };

  const updateVariable = (index: number, field: string, value: any) => {
    const newVariables = [...templateForm.template_variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setTemplateForm({ ...templateForm, template_variables: newVariables });
  };

  const addRecipient = () => {
    setSendForm({
      ...sendForm,
      recipients: [
        ...sendForm.recipients,
        {
          recipient_type: "family",
          name: "",
          email: "",
          relationship: "",
        },
      ],
    });
  };

  const removeRecipient = (index: number) => {
    const newRecipients = sendForm.recipients.filter((_, i) => i !== index);
    setSendForm({ ...sendForm, recipients: newRecipients });
  };

  const updateRecipient = (index: number, field: string, value: any) => {
    const newRecipients = [...sendForm.recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setSendForm({ ...sendForm, recipients: newRecipients });
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template_category
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const filteredCommunications = communications.filter(
    (comm) =>
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.sender.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Mail className="h-6 w-6 mr-3 text-blue-600" />
              Email Workflow Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Manage email templates, send communications, and track engagement
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog
              open={showTemplateDialog}
              onOpenChange={setShowTemplateDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates and communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="communications">Sent Communications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Email Templates Tab */}
        <TabsContent value="templates">
          <div className="grid gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.template_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {template.template_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {template.template_category.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                      <Badge variant="outline">
                        {template.template_variables.length} variables
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Subject Template
                      </Label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1">
                        {template.subject_template}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Body Preview
                      </Label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1 line-clamp-3">
                        {template.body_template.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(template.updated_at)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {template.created_by}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSendForm({
                              ...sendForm,
                              template_id: template.template_id,
                            });
                            setShowSendDialog(true);
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <div className="space-y-4">
            {filteredCommunications.map((comm) => (
              <Card
                key={comm.communication_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {comm.subject}
                        </h3>
                        <Badge className={getStatusColor(comm.status)}>
                          {comm.status}
                        </Badge>
                        <Badge className={getPriorityColor(comm.priority)}>
                          {comm.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">From:</span>{" "}
                          {comm.sender.name} ({comm.sender.role})
                        </div>
                        <div>
                          <span className="font-medium">Recipients:</span>{" "}
                          {comm.recipients.length} recipients
                        </div>
                        <div>
                          <span className="font-medium">Sent:</span>{" "}
                          {formatDate(comm.sent_at)}
                        </div>
                        <div>
                          <span className="font-medium">Template:</span>{" "}
                          {comm.template_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {comm.delivery_status.delivered}
                          </div>
                          <div className="text-xs text-gray-500">Delivered</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {comm.tracking.open_count}
                          </div>
                          <div className="text-xs text-gray-500">Opens</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">
                            {comm.tracking.click_count}
                          </div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Sent
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {communications.length}
                    </p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Delivery Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">98.7%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Open Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">77.1%</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Click Rate
                    </p>
                    <p className="text-2xl font-bold text-purple-600">19.1%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.slice(0, 5).map((template) => (
                  <div
                    key={template.template_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{template.template_name}</h4>
                      <p className="text-sm text-gray-600">
                        {template.template_category}
                      </p>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">82.0%</div>
                        <div className="text-gray-500">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          23.6%
                        </div>
                        <div className="text-gray-500">Click Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Email Tracking</Label>
                    <p className="text-sm text-gray-600">
                      Track email opens and clicks
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Require Approval for High Priority
                    </Label>
                    <p className="text-sm text-gray-600">
                      High priority emails need approval before sending
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Auto-archive Sent Emails
                    </Label>
                    <p className="text-sm text-gray-600">
                      Automatically archive emails after 90 days
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Email Delivery Notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified when emails are delivered
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Failed Delivery Alerts</Label>
                    <p className="text-sm text-gray-600">
                      Get alerted when email delivery fails
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  value={templateForm.template_name}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      template_name: e.target.value,
                    })
                  }
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template_category">Category</Label>
                <Select
                  value={templateForm.template_category}
                  onValueChange={(value) =>
                    setTemplateForm({
                      ...templateForm,
                      template_category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient_communication">
                      Patient Communication
                    </SelectItem>
                    <SelectItem value="incident_management">
                      Incident Management
                    </SelectItem>
                    <SelectItem value="committee_management">
                      Committee Management
                    </SelectItem>
                    <SelectItem value="regulatory_compliance">
                      Regulatory Compliance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject_template">Subject Template</Label>
              <Input
                id="subject_template"
                value={templateForm.subject_template}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    subject_template: e.target.value,
                  })
                }
                placeholder="Enter subject template with variables like {{patient_name}}"
              />
            </div>

            <div>
              <Label htmlFor="body_template">Body Template</Label>
              <Textarea
                id="body_template"
                value={templateForm.body_template}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    body_template: e.target.value,
                  })
                }
                placeholder="Enter email body template with variables like {{patient_name}}, {{care_updates}}"
                rows={8}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Template Variables</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariable}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variable
                </Button>
              </div>
              <div className="space-y-2">
                {templateForm.template_variables.map((variable, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <Input
                      placeholder="Variable name"
                      value={variable.variable_name}
                      onChange={(e) =>
                        updateVariable(index, "variable_name", e.target.value)
                      }
                    />
                    <Select
                      value={variable.variable_type}
                      onValueChange={(value) =>
                        updateVariable(index, "variable_type", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Description"
                      value={variable.description}
                      onChange={(e) =>
                        updateVariable(index, "description", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createTemplate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template_select">Select Template</Label>
              <Select
                value={sendForm.template_id}
                onValueChange={(value) =>
                  setSendForm({ ...sendForm, template_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem
                      key={template.template_id}
                      value={template.template_id}
                    >
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Recipients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipient
                </Button>
              </div>
              <div className="space-y-2">
                {sendForm.recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <Input
                      placeholder="Name"
                      value={recipient.name}
                      onChange={(e) =>
                        updateRecipient(index, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={recipient.email}
                      onChange={(e) =>
                        updateRecipient(index, "email", e.target.value)
                      }
                    />
                    <Select
                      value={recipient.recipient_type}
                      onValueChange={(value) =>
                        updateRecipient(index, "recipient_type", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="email_subject">Subject</Label>
              <Input
                id="email_subject"
                value={sendForm.subject}
                onChange={(e) =>
                  setSendForm({ ...sendForm, subject: e.target.value })
                }
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <Label htmlFor="email_body">Message</Label>
              <Textarea
                id="email_body"
                value={sendForm.body}
                onChange={(e) =>
                  setSendForm({ ...sendForm, body: e.target.value })
                }
                placeholder="Enter email message"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="email_priority">Priority</Label>
              <Select
                value={sendForm.priority}
                onValueChange={(value) =>
                  setSendForm({ ...sendForm, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSendDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={sendEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailWorkflowManager;
