import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Mail, Plus, Edit, Send, Eye, Trash2, Copy, Users, BarChart3, Clock, CheckCircle, Search, } from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import websocketService from "@/services/websocket.service";
const EmailWorkflowManager = () => {
    const [activeTab, setActiveTab] = useState("templates");
    const [templates, setTemplates] = useState([]);
    const [communications, setCommunications] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
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
    // Send Email Form State
    const [sendForm, setSendForm] = useState({
        template_id: "",
        recipients: [],
        subject: "",
        body: "",
        priority: "normal",
        variables: {},
    });
    useEffect(() => {
        loadTemplates();
        loadCommunications();
        // Subscribe to email notifications
        const unsubscribe = websocketService.subscribe("email_notifications", (data) => {
            console.log("Received email notification:", data);
            loadCommunications();
        });
        return () => {
            unsubscribe();
        };
    }, []);
    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const templateData = await communicationAPI.email.getEmailTemplates();
            setTemplates(templateData);
        }
        catch (error) {
            console.error("Error loading templates:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadCommunications = async () => {
        try {
            const commData = await communicationAPI.email.getEmailCommunications();
            setCommunications(commData);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
    const removeVariable = (index) => {
        const newVariables = templateForm.template_variables.filter((_, i) => i !== index);
        setTemplateForm({ ...templateForm, template_variables: newVariables });
    };
    const updateVariable = (index, field, value) => {
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
    const removeRecipient = (index) => {
        const newRecipients = sendForm.recipients.filter((_, i) => i !== index);
        setSendForm({ ...sendForm, recipients: newRecipients });
    };
    const updateRecipient = (index, field, value) => {
        const newRecipients = [...sendForm.recipients];
        newRecipients[index] = { ...newRecipients[index], [field]: value };
        setSendForm({ ...sendForm, recipients: newRecipients });
    };
    const filteredTemplates = templates.filter((template) => template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template_category
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
    const filteredCommunications = communications.filter((comm) => comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.sender.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const getStatusColor = (status) => {
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
    const getPriorityColor = (priority) => {
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
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading email workflow..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Mail, { className: "h-6 w-6 mr-3 text-blue-600" }), "Email Workflow Manager"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage email templates, send communications, and track engagement" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Dialog, { open: showTemplateDialog, onOpenChange: setShowTemplateDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Template"] }) }) }), _jsx(Dialog, { open: showSendDialog, onOpenChange: setShowSendDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Send Email"] }) }) })] })] }) }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search templates and communications...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "templates", children: "Email Templates" }), _jsx(TabsTrigger, { value: "communications", children: "Sent Communications" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "settings", children: "Settings" })] }), _jsx(TabsContent, { value: "templates", children: _jsx("div", { className: "grid gap-6", children: filteredTemplates.map((template) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: template.template_name }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Category: ", template.template_category.replace("_", " ")] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(template.status), children: template.status }), _jsxs(Badge, { variant: "outline", children: [template.template_variables.length, " variables"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Subject Template" }), _jsx("p", { className: "text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1", children: template.subject_template })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Body Preview" }), _jsxs("p", { className: "text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1 line-clamp-3", children: [template.body_template.substring(0, 200), "..."] })] }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-1" }), formatDate(template.updated_at)] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-1" }), template.created_by] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Copy, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                        setSendForm({
                                                                            ...sendForm,
                                                                            template_id: template.template_id,
                                                                        });
                                                                        setShowSendDialog(true);
                                                                    }, children: _jsx(Send, { className: "h-4 w-4" }) })] })] })] }) })] }, template.template_id))) }) }), _jsx(TabsContent, { value: "communications", children: _jsx("div", { className: "space-y-4", children: filteredCommunications.map((comm) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: comm.subject }), _jsx(Badge, { className: getStatusColor(comm.status), children: comm.status }), _jsx(Badge, { className: getPriorityColor(comm.priority), children: comm.priority })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "From:" }), " ", comm.sender.name, " (", comm.sender.role, ")"] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Recipients:" }), " ", comm.recipients.length, " recipients"] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Sent:" }), " ", formatDate(comm.sent_at)] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Template:" }), " ", comm.template_name] })] })] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsxs("div", { className: "flex space-x-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: comm.delivery_status.delivered }), _jsx("div", { className: "text-xs text-gray-500", children: "Delivered" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: comm.tracking.open_count }), _jsx("div", { className: "text-xs text-gray-500", children: "Opens" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-purple-600", children: comm.tracking.click_count }), _jsx("div", { className: "text-xs text-gray-500", children: "Clicks" })] })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(BarChart3, { className: "h-4 w-4" }) })] })] })] }) }) }, comm.communication_id))) }) }), _jsxs(TabsContent, { value: "analytics", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Sent" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: communications.length })] }), _jsx(Mail, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Delivery Rate" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "98.7%" })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Open Rate" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: "77.1%" })] }), _jsx(Eye, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Click Rate" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: "19.1%" })] }), _jsx(BarChart3, { className: "h-8 w-8 text-purple-600" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Template Performance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: templates.slice(0, 5).map((template) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: template.template_name }), _jsx("p", { className: "text-sm text-gray-600", children: template.template_category })] }), _jsxs("div", { className: "flex space-x-6 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "82.0%" }), _jsx("div", { className: "text-gray-500", children: "Open Rate" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "font-semibold text-purple-600", children: "23.6%" }), _jsx("div", { className: "text-gray-500", children: "Click Rate" })] })] })] }, template.template_id))) }) })] })] }), _jsx(TabsContent, { value: "settings", children: _jsxs("div", { className: "grid gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Email Configuration" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base", children: "Enable Email Tracking" }), _jsx("p", { className: "text-sm text-gray-600", children: "Track email opens and clicks" })] }), _jsx(Switch, { defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base", children: "Require Approval for High Priority" }), _jsx("p", { className: "text-sm text-gray-600", children: "High priority emails need approval before sending" })] }), _jsx(Switch, { defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base", children: "Auto-archive Sent Emails" }), _jsx("p", { className: "text-sm text-gray-600", children: "Automatically archive emails after 90 days" })] }), _jsx(Switch, {})] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Settings" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base", children: "Email Delivery Notifications" }), _jsx("p", { className: "text-sm text-gray-600", children: "Get notified when emails are delivered" })] }), _jsx(Switch, { defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base", children: "Failed Delivery Alerts" }), _jsx("p", { className: "text-sm text-gray-600", children: "Get alerted when email delivery fails" })] }), _jsx(Switch, { defaultChecked: true })] })] })] })] }) })] }), _jsx(Dialog, { open: showTemplateDialog, onOpenChange: setShowTemplateDialog, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Email Template" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "template_name", children: "Template Name" }), _jsx(Input, { id: "template_name", value: templateForm.template_name, onChange: (e) => setTemplateForm({
                                                        ...templateForm,
                                                        template_name: e.target.value,
                                                    }), placeholder: "Enter template name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "template_category", children: "Category" }), _jsxs(Select, { value: templateForm.template_category, onValueChange: (value) => setTemplateForm({
                                                        ...templateForm,
                                                        template_category: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "patient_communication", children: "Patient Communication" }), _jsx(SelectItem, { value: "incident_management", children: "Incident Management" }), _jsx(SelectItem, { value: "committee_management", children: "Committee Management" }), _jsx(SelectItem, { value: "regulatory_compliance", children: "Regulatory Compliance" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "subject_template", children: "Subject Template" }), _jsx(Input, { id: "subject_template", value: templateForm.subject_template, onChange: (e) => setTemplateForm({
                                                ...templateForm,
                                                subject_template: e.target.value,
                                            }), placeholder: "Enter subject template with variables like {{patient_name}}" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "body_template", children: "Body Template" }), _jsx(Textarea, { id: "body_template", value: templateForm.body_template, onChange: (e) => setTemplateForm({
                                                ...templateForm,
                                                body_template: e.target.value,
                                            }), placeholder: "Enter email body template with variables like {{patient_name}}, {{care_updates}}", rows: 8 })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Label, { children: "Template Variables" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addVariable, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Variable"] })] }), _jsx("div", { className: "space-y-2", children: templateForm.template_variables.map((variable, index) => (_jsxs("div", { className: "flex items-center space-x-2 p-2 border rounded", children: [_jsx(Input, { placeholder: "Variable name", value: variable.variable_name, onChange: (e) => updateVariable(index, "variable_name", e.target.value) }), _jsxs(Select, { value: variable.variable_type, onValueChange: (value) => updateVariable(index, "variable_type", value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "text", children: "Text" }), _jsx(SelectItem, { value: "textarea", children: "Textarea" }), _jsx(SelectItem, { value: "date", children: "Date" }), _jsx(SelectItem, { value: "number", children: "Number" })] })] }), _jsx(Input, { placeholder: "Description", value: variable.description, onChange: (e) => updateVariable(index, "description", e.target.value) }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeVariable(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowTemplateDialog(false), children: "Cancel" }), _jsx(Button, { onClick: createTemplate, className: "bg-blue-600 hover:bg-blue-700", children: "Create Template" })] })] })] }) }), _jsx(Dialog, { open: showSendDialog, onOpenChange: setShowSendDialog, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Send Email" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "template_select", children: "Select Template" }), _jsxs(Select, { value: sendForm.template_id, onValueChange: (value) => setSendForm({ ...sendForm, template_id: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a template" }) }), _jsx(SelectContent, { children: templates.map((template) => (_jsx(SelectItem, { value: template.template_id, children: template.template_name }, template.template_id))) })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Label, { children: "Recipients" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addRecipient, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Recipient"] })] }), _jsx("div", { className: "space-y-2", children: sendForm.recipients.map((recipient, index) => (_jsxs("div", { className: "flex items-center space-x-2 p-2 border rounded", children: [_jsx(Input, { placeholder: "Name", value: recipient.name, onChange: (e) => updateRecipient(index, "name", e.target.value) }), _jsx(Input, { placeholder: "Email", type: "email", value: recipient.email, onChange: (e) => updateRecipient(index, "email", e.target.value) }), _jsxs(Select, { value: recipient.recipient_type, onValueChange: (value) => updateRecipient(index, "recipient_type", value), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "family", children: "Family" }), _jsx(SelectItem, { value: "staff", children: "Staff" }), _jsx(SelectItem, { value: "external", children: "External" })] })] }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeRecipient(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email_subject", children: "Subject" }), _jsx(Input, { id: "email_subject", value: sendForm.subject, onChange: (e) => setSendForm({ ...sendForm, subject: e.target.value }), placeholder: "Enter email subject" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email_body", children: "Message" }), _jsx(Textarea, { id: "email_body", value: sendForm.body, onChange: (e) => setSendForm({ ...sendForm, body: e.target.value }), placeholder: "Enter email message", rows: 6 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email_priority", children: "Priority" }), _jsxs(Select, { value: sendForm.priority, onValueChange: (value) => setSendForm({ ...sendForm, priority: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "normal", children: "Normal" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowSendDialog(false), children: "Cancel" }), _jsxs(Button, { onClick: sendEmail, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Send Email"] })] })] })] }) })] }));
};
export default EmailWorkflowManager;
