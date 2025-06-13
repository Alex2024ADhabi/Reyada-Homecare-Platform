import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Download, Save, Play, Settings, BarChart3, Table, PieChart, LineChart, Calendar, Filter, SortAsc, SortDesc, Eye, } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export const ReportBuilder = ({ availableFields, onSave, onRun, onExport, existingTemplate, className, }) => {
    const [template, setTemplate] = React.useState({
        name: existingTemplate?.name || "",
        description: existingTemplate?.description || "",
        fields: existingTemplate?.fields || [],
        filters: existingTemplate?.filters || [],
        sorting: existingTemplate?.sorting || [],
        visualizations: existingTemplate?.visualizations || [],
        schedule: existingTemplate?.schedule,
    });
    const [activeTab, setActiveTab] = React.useState("fields");
    const [previewData, setPreviewData] = React.useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const addField = (field) => {
        if (!template.fields.find((f) => f.id === field.id)) {
            setTemplate((prev) => ({
                ...prev,
                fields: [...prev.fields, field],
            }));
        }
    };
    const removeField = (fieldId) => {
        setTemplate((prev) => ({
            ...prev,
            fields: prev.fields.filter((f) => f.id !== fieldId),
        }));
    };
    const addFilter = () => {
        const newFilter = {
            id: `filter_${Date.now()}`,
            field: "",
            operator: "equals",
            value: "",
        };
        setTemplate((prev) => ({
            ...prev,
            filters: [...prev.filters, newFilter],
        }));
    };
    const updateFilter = (filterId, updates) => {
        setTemplate((prev) => ({
            ...prev,
            filters: prev.filters.map((f) => f.id === filterId ? { ...f, ...updates } : f),
        }));
    };
    const removeFilter = (filterId) => {
        setTemplate((prev) => ({
            ...prev,
            filters: prev.filters.filter((f) => f.id !== filterId),
        }));
    };
    const addSort = (field, direction) => {
        setTemplate((prev) => ({
            ...prev,
            sorting: [
                ...prev.sorting.filter((s) => s.field !== field),
                { field, direction },
            ],
        }));
    };
    const removeSort = (field) => {
        setTemplate((prev) => ({
            ...prev,
            sorting: prev.sorting.filter((s) => s.field !== field),
        }));
    };
    const addVisualization = (type) => {
        const newViz = {
            type,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
            fields: [],
        };
        setTemplate((prev) => ({
            ...prev,
            visualizations: [...prev.visualizations, newViz],
        }));
    };
    const updateVisualization = (index, updates) => {
        setTemplate((prev) => ({
            ...prev,
            visualizations: prev.visualizations.map((v, i) => i === index ? { ...v, ...updates } : v),
        }));
    };
    const removeVisualization = (index) => {
        setTemplate((prev) => ({
            ...prev,
            visualizations: prev.visualizations.filter((_, i) => i !== index),
        }));
    };
    const handleSave = () => {
        if (template.name.trim()) {
            onSave(template);
        }
    };
    const handleRun = () => {
        if (existingTemplate) {
            onRun({ ...existingTemplate, ...template });
        }
    };
    const handlePreview = () => {
        // Generate mock preview data based on selected fields
        const mockData = Array.from({ length: 10 }, (_, i) => {
            const row = {};
            template.fields.forEach((field) => {
                switch (field.type) {
                    case "text":
                        row[field.name] = `Sample ${field.name} ${i + 1}`;
                        break;
                    case "number":
                        row[field.name] = Math.floor(Math.random() * 1000);
                        break;
                    case "date":
                        row[field.name] = format(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
                        break;
                    case "boolean":
                        row[field.name] = Math.random() > 0.5;
                        break;
                    default:
                        row[field.name] = `Value ${i + 1}`;
                }
            });
            return row;
        });
        setPreviewData(mockData);
        setIsPreviewOpen(true);
    };
    const renderFieldsTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Select Fields" }), _jsxs(Badge, { variant: "secondary", children: [template.fields.length, " selected"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Available Fields" }) }), _jsx(CardContent, { className: "space-y-2 max-h-96 overflow-y-auto", children: availableFields.map((field) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded hover:bg-gray-50", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: field.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [field.type, " \u2022 ", field.source] })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => addField(field), disabled: template.fields.some((f) => f.id === field.id), children: _jsx(Plus, { className: "h-3 w-3" }) })] }, field.id))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-sm", children: "Selected Fields" }) }), _jsx(CardContent, { className: "space-y-2 max-h-96 overflow-y-auto", children: template.fields.map((field) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded bg-blue-50", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: field.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [field.type, " \u2022 ", field.source] })] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => removeField(field.id), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }, field.id))) })] })] })] }));
    const renderFiltersTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Filters" }), _jsxs(Button, { onClick: addFilter, size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Filter"] })] }), _jsxs("div", { className: "space-y-3", children: [template.filters.map((filter) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 items-end", children: [_jsxs("div", { children: [_jsx(Label, { children: "Field" }), _jsxs(Select, { value: filter.field, onValueChange: (value) => updateFilter(filter.id, { field: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select field" }) }), _jsx(SelectContent, { children: template.fields.map((field) => (_jsx(SelectItem, { value: field.id, children: field.name }, field.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Operator" }), _jsxs(Select, { value: filter.operator, onValueChange: (value) => updateFilter(filter.id, { operator: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "equals", children: "Equals" }), _jsx(SelectItem, { value: "contains", children: "Contains" }), _jsx(SelectItem, { value: "greater", children: "Greater than" }), _jsx(SelectItem, { value: "less", children: "Less than" }), _jsx(SelectItem, { value: "between", children: "Between" }), _jsx(SelectItem, { value: "in", children: "In" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Value" }), _jsx(Input, { value: filter.value, onChange: (e) => updateFilter(filter.id, { value: e.target.value }), placeholder: "Enter value" })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeFilter(filter.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) }) }, filter.id))), template.filters.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No filters added. Click \"Add Filter\" to create one." }))] })] }));
    const renderSortingTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Sorting" }), _jsx("div", { className: "space-y-3", children: template.fields.map((field) => {
                    const sort = template.sorting.find((s) => s.field === field.id);
                    return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: field.name }), _jsx("div", { className: "text-sm text-gray-500", children: field.type })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [sort && (_jsx(Badge, { variant: "secondary", children: sort.direction === "asc" ? "Ascending" : "Descending" })), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Settings, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { onClick: () => addSort(field.id, "asc"), children: [_jsx(SortAsc, { className: "h-4 w-4 mr-2" }), "Sort Ascending"] }), _jsxs(DropdownMenuItem, { onClick: () => addSort(field.id, "desc"), children: [_jsx(SortDesc, { className: "h-4 w-4 mr-2" }), "Sort Descending"] }), sort && (_jsxs(DropdownMenuItem, { onClick: () => removeSort(field.id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Remove Sort"] }))] })] })] })] }, field.id));
                }) })] }));
    const renderVisualizationsTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Visualizations" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Chart"] }) }), _jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { onClick: () => addVisualization("table"), children: [_jsx(Table, { className: "h-4 w-4 mr-2" }), "Table"] }), _jsxs(DropdownMenuItem, { onClick: () => addVisualization("bar"), children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Bar Chart"] }), _jsxs(DropdownMenuItem, { onClick: () => addVisualization("line"), children: [_jsx(LineChart, { className: "h-4 w-4 mr-2" }), "Line Chart"] }), _jsxs(DropdownMenuItem, { onClick: () => addVisualization("pie"), children: [_jsx(PieChart, { className: "h-4 w-4 mr-2" }), "Pie Chart"] })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: template.visualizations.map((viz, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-sm", children: viz.title }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeVisualization(index), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { children: "Title" }), _jsx(Input, { value: viz.title, onChange: (e) => updateVisualization(index, { title: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Fields" }), _jsx("div", { className: "space-y-2", children: template.fields.map((field) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: viz.fields.includes(field.id), onCheckedChange: (checked) => {
                                                            const newFields = checked
                                                                ? [...viz.fields, field.id]
                                                                : viz.fields.filter((f) => f !== field.id);
                                                            updateVisualization(index, { fields: newFields });
                                                        } }), _jsx(Label, { className: "text-sm", children: field.name })] }, field.id))) })] })] })] }, index))) }), template.visualizations.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No visualizations added. Click \"Add Chart\" to create one." }))] }));
    const renderScheduleTab = () => (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Schedule (Optional)" }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: !!template.schedule, onCheckedChange: (checked) => {
                                        setTemplate((prev) => ({
                                            ...prev,
                                            schedule: checked
                                                ? {
                                                    frequency: "daily",
                                                    time: "09:00",
                                                    recipients: [],
                                                }
                                                : undefined,
                                        }));
                                    } }), _jsx(Label, { children: "Enable automatic report generation" })] }), template.schedule && (_jsxs("div", { className: "space-y-4 pl-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Frequency" }), _jsxs(Select, { value: template.schedule.frequency, onValueChange: (value) => setTemplate((prev) => ({
                                                        ...prev,
                                                        schedule: prev.schedule
                                                            ? { ...prev.schedule, frequency: value }
                                                            : undefined,
                                                    })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" }), _jsx(SelectItem, { value: "monthly", children: "Monthly" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Time" }), _jsx(Input, { type: "time", value: template.schedule.time, onChange: (e) => setTemplate((prev) => ({
                                                        ...prev,
                                                        schedule: prev.schedule
                                                            ? { ...prev.schedule, time: e.target.value }
                                                            : undefined,
                                                    })) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Recipients (comma-separated emails)" }), _jsx(Textarea, { value: template.schedule.recipients.join(", "), onChange: (e) => setTemplate((prev) => ({
                                                ...prev,
                                                schedule: prev.schedule
                                                    ? {
                                                        ...prev.schedule,
                                                        recipients: e.target.value
                                                            .split(",")
                                                            .map((email) => email.trim())
                                                            .filter(Boolean),
                                                    }
                                                    : undefined,
                                            })), placeholder: "user1@example.com, user2@example.com" })] })] }))] }) })] }));
    return (_jsxs("div", { className: cn("w-full space-y-6", className), children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex items-center space-x-2", children: _jsx(Input, { value: template.name, onChange: (e) => setTemplate((prev) => ({ ...prev, name: e.target.value })), placeholder: "Report Name", className: "text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0" }) }), _jsx(Textarea, { value: template.description, onChange: (e) => setTemplate((prev) => ({ ...prev, description: e.target.value })), placeholder: "Report description (optional)", className: "text-sm text-gray-600 border-none p-0 resize-none focus-visible:ring-0", rows: 2 })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: handlePreview, children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Preview"] }), _jsxs(Button, { variant: "outline", onClick: handleRun, children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Run"] }), _jsxs(Button, { onClick: handleSave, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save"] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }) }), _jsxs(DropdownMenuContent, { children: [_jsx(DropdownMenuItem, { onClick: () => existingTemplate && onExport(existingTemplate, "pdf"), children: "Export as PDF" }), _jsx(DropdownMenuItem, { onClick: () => existingTemplate && onExport(existingTemplate, "excel"), children: "Export as Excel" }), _jsx(DropdownMenuItem, { onClick: () => existingTemplate && onExport(existingTemplate, "csv"), children: "Export as CSV" })] })] })] })] }), _jsx("div", { className: "border-b", children: _jsx("nav", { className: "flex space-x-8", children: [
                        { id: "fields", label: "Fields", icon: Table },
                        { id: "filters", label: "Filters", icon: Filter },
                        { id: "sorting", label: "Sorting", icon: SortAsc },
                        { id: "visualizations", label: "Charts", icon: BarChart3 },
                        { id: "schedule", label: "Schedule", icon: Calendar },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: cn("flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"), children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                    }) }) }), _jsxs("div", { className: "min-h-96", children: [activeTab === "fields" && renderFieldsTab(), activeTab === "filters" && renderFiltersTab(), activeTab === "sorting" && renderSortingTab(), activeTab === "visualizations" && renderVisualizationsTab(), activeTab === "schedule" && renderScheduleTab()] }), _jsx(Dialog, { open: isPreviewOpen, onOpenChange: setIsPreviewOpen, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Report Preview" }), _jsx(DialogDescription, { children: "Preview of your report with sample data" })] }), _jsxs("div", { className: "space-y-4", children: [template.fields.length > 0 && (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse border border-gray-300", children: [_jsx("thead", { children: _jsx("tr", { className: "bg-gray-50", children: template.fields.map((field) => (_jsx("th", { className: "border border-gray-300 px-4 py-2 text-left font-medium", children: field.name }, field.id))) }) }), _jsx("tbody", { children: previewData.map((row, index) => (_jsx("tr", { className: "hover:bg-gray-50", children: template.fields.map((field) => (_jsx("td", { className: "border border-gray-300 px-4 py-2", children: String(row[field.name] || "-") }, field.id))) }, index))) })] }) })), template.fields.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No fields selected. Please add fields to see the preview." }))] }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setIsPreviewOpen(false), children: "Close" }) })] }) })] }));
};
export default ReportBuilder;
