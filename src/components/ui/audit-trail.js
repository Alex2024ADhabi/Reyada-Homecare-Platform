import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Shield, User, Calendar, Search, Download, Eye, Edit, Trash2, Plus, FileText, Database, Settings, } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export const AuditTrail = ({ className, maxHeight = "600px", showFilters = true, resourceId, resourceType, onEntryClick, }) => {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [resourceTypeFilter, setResourceTypeFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [dateRange, setDateRange] = useState("7d");
    const [selectedEntry, setSelectedEntry] = useState(null);
    useEffect(() => {
        loadAuditEntries();
    }, [resourceId, resourceType, dateRange]);
    useEffect(() => {
        filterEntries();
    }, [entries, searchTerm, actionFilter, resourceTypeFilter, severityFilter]);
    const loadAuditEntries = async () => {
        setLoading(true);
        try {
            // In a real app, this would fetch from your audit API
            const mockEntries = generateMockAuditEntries();
            setEntries(mockEntries);
        }
        catch (error) {
            console.error("Failed to load audit entries:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockAuditEntries = () => {
        const now = new Date();
        const users = [
            { id: "user1", name: "Dr. Sarah Ahmed", role: "Physician" },
            { id: "user2", name: "Nurse John Smith", role: "Nurse" },
            { id: "user3", name: "Admin Alice Johnson", role: "Administrator" },
            { id: "user4", name: "Therapist Mike Brown", role: "Therapist" },
        ];
        const mockEntries = [];
        for (let i = 0; i < 50; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const actions = [
                "create",
                "read",
                "update",
                "delete",
                "login",
                "logout",
                "export",
            ];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const resourceTypes = [
                "patient",
                "clinical-form",
                "authorization",
                "claim",
                "user",
                "system",
                "report",
            ];
            const resType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            const severities = [
                "low",
                "medium",
                "high",
                "critical",
            ];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
            mockEntries.push({
                id: `audit-${i + 1}`,
                timestamp,
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                action,
                resource: `${resType}-${Math.floor(Math.random() * 1000)}`,
                resourceId: `${resType}-${Math.floor(Math.random() * 1000)}`,
                resourceType: resType,
                description: generateActionDescription(action, resType, user.name),
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
                severity,
                metadata: {
                    module: resType,
                    duration: Math.floor(Math.random() * 300), // seconds
                },
                changes: action === "update" ? generateMockChanges() : undefined,
            });
        }
        return mockEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };
    const generateActionDescription = (action, resourceType, userName) => {
        const descriptions = {
            create: `${userName} created a new ${resourceType}`,
            read: `${userName} viewed ${resourceType} details`,
            update: `${userName} updated ${resourceType} information`,
            delete: `${userName} deleted a ${resourceType}`,
            login: `${userName} logged into the system`,
            logout: `${userName} logged out of the system`,
            export: `${userName} exported ${resourceType} data`,
            import: `${userName} imported ${resourceType} data`,
        };
        return (descriptions[action] ||
            `${userName} performed ${action} on ${resourceType}`);
    };
    const generateMockChanges = () => {
        const fields = ["status", "priority", "assignee", "notes", "date"];
        const numChanges = Math.floor(Math.random() * 3) + 1;
        const changes = [];
        for (let i = 0; i < numChanges; i++) {
            const field = fields[Math.floor(Math.random() * fields.length)];
            changes.push({
                field,
                oldValue: `old-${field}-value`,
                newValue: `new-${field}-value`,
            });
        }
        return changes;
    };
    const filterEntries = () => {
        let filtered = entries;
        // Filter by resource if specified
        if (resourceId && resourceType) {
            filtered = filtered.filter((entry) => entry.resourceId === resourceId &&
                entry.resourceType === resourceType);
        }
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((entry) => entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.resource.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        // Action filter
        if (actionFilter !== "all") {
            filtered = filtered.filter((entry) => entry.action === actionFilter);
        }
        // Resource type filter
        if (resourceTypeFilter !== "all") {
            filtered = filtered.filter((entry) => entry.resourceType === resourceTypeFilter);
        }
        // Severity filter
        if (severityFilter !== "all") {
            filtered = filtered.filter((entry) => entry.severity === severityFilter);
        }
        setFilteredEntries(filtered);
    };
    const getActionIcon = (action) => {
        switch (action) {
            case "create":
                return _jsx(Plus, { className: "h-4 w-4 text-green-500" });
            case "read":
                return _jsx(Eye, { className: "h-4 w-4 text-blue-500" });
            case "update":
                return _jsx(Edit, { className: "h-4 w-4 text-yellow-500" });
            case "delete":
                return _jsx(Trash2, { className: "h-4 w-4 text-red-500" });
            case "login":
            case "logout":
                return _jsx(User, { className: "h-4 w-4 text-purple-500" });
            case "export":
            case "import":
                return _jsx(Download, { className: "h-4 w-4 text-indigo-500" });
            default:
                return _jsx(FileText, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const exportAuditLog = () => {
        const exportData = {
            exportedAt: new Date().toISOString(),
            filters: {
                searchTerm,
                actionFilter,
                resourceTypeFilter,
                severityFilter,
                dateRange,
            },
            entries: filteredEntries,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
        if (onEntryClick) {
            onEntryClick(entry);
        }
    };
    return (_jsxs("div", { className: cn("space-y-4", className), children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Audit Trail"] }), _jsx(CardDescription, { children: "Comprehensive log of all system activities and changes" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", children: [filteredEntries.length, " entries"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: exportAuditLog, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }) }), showFilters && (_jsx(CardContent, { className: "border-b", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search entries...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs(Select, { value: actionFilter, onValueChange: setActionFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Actions" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Actions" }), _jsx(SelectItem, { value: "create", children: "Create" }), _jsx(SelectItem, { value: "read", children: "Read" }), _jsx(SelectItem, { value: "update", children: "Update" }), _jsx(SelectItem, { value: "delete", children: "Delete" }), _jsx(SelectItem, { value: "login", children: "Login" }), _jsx(SelectItem, { value: "logout", children: "Logout" }), _jsx(SelectItem, { value: "export", children: "Export" })] })] }), _jsxs(Select, { value: resourceTypeFilter, onValueChange: setResourceTypeFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Resources" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Resources" }), _jsx(SelectItem, { value: "patient", children: "Patient" }), _jsx(SelectItem, { value: "clinical-form", children: "Clinical Form" }), _jsx(SelectItem, { value: "authorization", children: "Authorization" }), _jsx(SelectItem, { value: "claim", children: "Claim" }), _jsx(SelectItem, { value: "user", children: "User" }), _jsx(SelectItem, { value: "system", children: "System" }), _jsx(SelectItem, { value: "report", children: "Report" })] })] }), _jsxs(Select, { value: severityFilter, onValueChange: setSeverityFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Severities" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Severities" }), _jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] }), _jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Date Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1d", children: "Last 24 hours" }), _jsx(SelectItem, { value: "7d", children: "Last 7 days" }), _jsx(SelectItem, { value: "30d", children: "Last 30 days" }), _jsx(SelectItem, { value: "90d", children: "Last 90 days" })] })] })] }) })), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { style: { height: maxHeight }, children: loading ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { children: "Loading audit entries..." })] })) : filteredEntries.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx(Shield, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No audit entries found" })] })) : (_jsx("div", { className: "divide-y", children: filteredEntries.map((entry) => (_jsx("div", { className: "p-4 hover:bg-gray-50 cursor-pointer transition-colors", onClick: () => handleEntryClick(entry), children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: getActionIcon(entry.action) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: entry.userName }), _jsx(Badge, { variant: "outline", className: "text-xs", children: entry.userRole }), _jsx(Badge, { variant: "outline", className: cn("text-xs", getSeverityColor(entry.severity)), children: entry.severity })] }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: entry.description }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), _jsx("span", { children: format(entry.timestamp, "PPpp") })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Database, { className: "h-3 w-3" }), _jsx("span", { children: entry.resource })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Settings, { className: "h-3 w-3" }), _jsx("span", { children: entry.action })] })] }), entry.changes && entry.changes.length > 0 && (_jsxs("div", { className: "mt-2 p-2 bg-gray-50 rounded text-xs", children: [_jsx("strong", { children: "Changes:" }), _jsx("ul", { className: "mt-1 space-y-1", children: entry.changes.map((change, index) => (_jsxs("li", { children: [_jsxs("span", { className: "font-medium", children: [change.field, ":"] }), _jsx("span", { className: "text-red-600 line-through ml-1", children: change.oldValue }), _jsx("span", { className: "mx-1", children: "\u2192" }), _jsx("span", { className: "text-green-600", children: change.newValue })] }, index))) })] }))] })] }) }, entry.id))) })) }) })] }), selectedEntry && (_jsxs(Card, { className: "fixed inset-4 z-50 bg-background border shadow-lg overflow-auto", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [getActionIcon(selectedEntry.action), "Audit Entry Details"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedEntry(null), children: "\u00D7" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "User Information" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "Name:" }), " ", selectedEntry.userName] }), _jsxs("p", { children: [_jsx("strong", { children: "Role:" }), " ", selectedEntry.userRole] }), _jsxs("p", { children: [_jsx("strong", { children: "User ID:" }), " ", selectedEntry.userId] }), _jsxs("p", { children: [_jsx("strong", { children: "Session ID:" }), " ", selectedEntry.sessionId] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Action Details" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "Action:" }), " ", selectedEntry.action] }), _jsxs("p", { children: [_jsx("strong", { children: "Resource:" }), " ", selectedEntry.resource] }), _jsxs("p", { children: [_jsx("strong", { children: "Resource Type:" }), " ", selectedEntry.resourceType] }), _jsxs("p", { children: [_jsx("strong", { children: "Severity:" }), " ", selectedEntry.severity] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Technical Details" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "IP Address:" }), " ", selectedEntry.ipAddress] }), _jsxs("p", { children: [_jsx("strong", { children: "Timestamp:" }), " ", format(selectedEntry.timestamp, "PPpp")] }), _jsxs("p", { children: [_jsx("strong", { children: "User Agent:" }), " ", selectedEntry.userAgent] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Metadata" }), _jsx("div", { className: "space-y-1 text-sm", children: selectedEntry.metadata &&
                                                    Object.entries(selectedEntry.metadata).map(([key, value]) => (_jsxs("p", { children: [_jsxs("strong", { children: [key, ":"] }), " ", String(value)] }, key))) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Description" }), _jsx("p", { className: "text-sm bg-gray-50 p-3 rounded", children: selectedEntry.description })] }), selectedEntry.changes && selectedEntry.changes.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Changes Made" }), _jsx("div", { className: "space-y-2", children: selectedEntry.changes.map((change, index) => (_jsxs("div", { className: "bg-gray-50 p-3 rounded", children: [_jsx("div", { className: "font-medium text-sm mb-1", children: change.field }), _jsxs("div", { className: "text-sm", children: [_jsxs("span", { className: "text-red-600", children: ["From: ", JSON.stringify(change.oldValue)] }), _jsx("br", {}), _jsxs("span", { className: "text-green-600", children: ["To: ", JSON.stringify(change.newValue)] })] })] }, index))) })] }))] })] }))] }));
};
export default AuditTrail;
