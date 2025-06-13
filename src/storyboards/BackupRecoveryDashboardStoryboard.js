import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HardDrive, RefreshCw, Database, AlertTriangle, CheckCircle, XCircle, Clock, Shield, Zap, Play, } from "lucide-react";
const BackupRecoveryDashboard = () => {
    const [backupStatus, setBackupStatus] = useState(null);
    const [drStatus, setDrStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const fetchBackupStatus = async () => {
        try {
            const response = await fetch("/api/doh-audit/backup-status");
            const data = await response.json();
            if (data.success) {
                setBackupStatus(data.backupStatus);
            }
        }
        catch (error) {
            console.error("Error fetching backup status:", error);
        }
    };
    const fetchDRStatus = async () => {
        try {
            const response = await fetch("/api/doh-audit/disaster-recovery-status");
            const data = await response.json();
            if (data.success) {
                setDrStatus(data.drStatus);
            }
        }
        catch (error) {
            console.error("Error fetching DR status:", error);
        }
    };
    const triggerBackup = async (type = "incremental") => {
        setLoading(true);
        try {
            const response = await fetch("/api/doh-audit/trigger-backup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ backupType: type }),
            });
            const data = await response.json();
            if (data.success) {
                await fetchBackupStatus();
            }
        }
        catch (error) {
            console.error("Error triggering backup:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const initiateDRTest = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/doh-audit/initiate-dr-test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ testType: "partial" }),
            });
            const data = await response.json();
            if (data.success) {
                await fetchDRStatus();
            }
        }
        catch (error) {
            console.error("Error initiating DR test:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBackupStatus();
        fetchDRStatus();
    }, []);
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "healthy":
            case "completed":
                return "text-green-600";
            case "warning":
            case "running":
                return "text-yellow-600";
            case "critical":
            case "failed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case "healthy":
            case "completed":
                return _jsx(Badge, { className: "bg-green-100 text-green-800", children: status });
            case "warning":
            case "running":
                return (_jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: status }));
            case "critical":
            case "failed":
                return _jsx(Badge, { className: "bg-red-100 text-red-800", children: status });
            default:
                return _jsx(Badge, { className: "bg-gray-100 text-gray-800", children: status });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Backup & Recovery Management" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Comprehensive backup and disaster recovery monitoring and management" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Button, { onClick: () => fetchBackupStatus(), disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs(Button, { onClick: () => triggerBackup("incremental"), disabled: loading, children: [_jsx(HardDrive, { className: "h-4 w-4 mr-2" }), "Trigger Backup"] })] })] }) }), drStatus?.overallReadiness?.score < 50 && (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Critical: Backup & Recovery System Not Implemented" }), _jsxs(AlertDescription, { className: "text-red-700", children: ["Your system currently has a backup readiness score of", " ", drStatus?.overallReadiness?.score, "%. Immediate action is required to implement automated backups and disaster recovery procedures."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(HardDrive, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "Backup System" })] }), _jsx("div", { className: "text-2xl font-bold mt-2 text-red-600", children: "NOT IMPLEMENTED" }), _jsx("div", { className: "text-sm text-red-600 mt-1", children: "No automated backups" })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "DR Readiness" })] }), _jsxs("div", { className: "text-2xl font-bold mt-2 text-red-600", children: [drStatus?.overallReadiness?.score || 0, "%"] }), _jsx(Progress, { value: drStatus?.overallReadiness?.score || 0, className: "mt-2" })] }) }), _jsx(Card, { className: "border-yellow-200 bg-yellow-50", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "RTO Target" })] }), _jsx("div", { className: "text-2xl font-bold mt-2 text-yellow-600", children: "4 Hours" }), _jsx("div", { className: "text-sm text-yellow-600 mt-1", children: "Not tested" })] }) }), _jsx(Card, { className: "border-yellow-200 bg-yellow-50", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "RPO Target" })] }), _jsx("div", { className: "text-2xl font-bold mt-2 text-yellow-600", children: "1 Hour" }), _jsx("div", { className: "text-sm text-yellow-600 mt-1", children: "Not tested" })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "backups", children: "Backups" }), _jsx(TabsTrigger, { value: "disaster-recovery", children: "Disaster Recovery" }), _jsx(TabsTrigger, { value: "implementation", children: "Implementation" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), _jsx("span", { children: "Critical Gaps" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: drStatus?.criticalGaps?.map((gap, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(XCircle, { className: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: gap })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { children: "Immediate Actions" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: drStatus?.immediateActions
                                                            ?.slice(0, 6)
                                                            .map((action, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: action })] }, index))) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "System Components Status" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: drStatus?.drComponents &&
                                                    Object.entries(drStatus.drComponents).map(([key, component]) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium text-sm capitalize", children: key.replace(/([A-Z])/g, " $1").trim() }), getStatusBadge(component.status)] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Completeness: ", component.completeness || 0, "%"] })] }, key))) }) })] })] }), _jsx(TabsContent, { value: "backups", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Backup Status" }), _jsx(CardDescription, { children: "Current backup system status and recent activity" })] }), _jsx(CardContent, { children: backupStatus ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: backupStatus.currentBackups?.completed || 0 }), _jsx("div", { className: "text-sm text-gray-500", children: "Completed" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: backupStatus.currentBackups?.failed || 0 }), _jsx("div", { className: "text-sm text-gray-500", children: "Failed" })] })] }), backupStatus.lastBackup && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Last Backup" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Type:" }), _jsx("span", { className: "capitalize", children: backupStatus.lastBackup.type })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Status:" }), getStatusBadge(backupStatus.lastBackup.status)] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Duration:" }), _jsx("span", { children: backupStatus.lastBackup.duration })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Size:" }), _jsx("span", { children: backupStatus.lastBackup.dataSize })] })] })] }))] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(HardDrive, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No backup system configured" })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Backup Actions" }), _jsx(CardDescription, { children: "Manual backup operations and testing" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: () => triggerBackup("full"), disabled: loading, className: "w-full", children: [_jsx(HardDrive, { className: "h-4 w-4 mr-2" }), "Trigger Full Backup"] }), _jsxs(Button, { onClick: () => triggerBackup("incremental"), disabled: loading, variant: "outline", className: "w-full", children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), "Trigger Incremental Backup"] }), _jsxs(Button, { disabled: true, variant: "outline", className: "w-full", children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Test Backup Restoration", _jsx("span", { className: "ml-2 text-xs", children: "(Not Available)" })] })] })] })] }) }), _jsx(TabsContent, { value: "disaster-recovery", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DR Test Results" }), _jsx(CardDescription, { children: "Disaster recovery testing history and results" })] }), _jsx(CardContent, { children: drStatus?.lastDrTest?.date ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Last Test:" }), _jsx("span", { children: drStatus.lastDrTest.date })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Type:" }), _jsx("span", { className: "capitalize", children: drStatus.lastDrTest.type })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "font-medium", children: "Issues:" }), drStatus.lastDrTest.issues.map((issue, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(XCircle, { className: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: issue })] }, index)))] })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Shield, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No DR tests have been conducted" }), _jsxs(Button, { onClick: initiateDRTest, disabled: loading, className: "mt-4", children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Initiate DR Test"] })] })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "RTO/RPO Targets" }), _jsx(CardDescription, { children: "Recovery time and point objectives" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Recovery Time Objective (RTO)" }), _jsx("div", { className: "text-sm text-gray-500", children: "Maximum acceptable downtime" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-bold text-lg", children: drStatus?.rtoRpoTargets?.rto?.target }), _jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: drStatus?.rtoRpoTargets?.rto?.status })] })] }), _jsxs("div", { className: "flex justify-between items-center p-3 border rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Recovery Point Objective (RPO)" }), _jsx("div", { className: "text-sm text-gray-500", children: "Maximum acceptable data loss" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-bold text-lg", children: drStatus?.rtoRpoTargets?.rpo?.target }), _jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: drStatus?.rtoRpoTargets?.rpo?.status })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "implementation", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Implementation Roadmap" }), _jsx(CardDescription, { children: "Step-by-step plan to implement backup and disaster recovery" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: [
                                                {
                                                    phase: "Phase 1: Critical Backup Implementation",
                                                    duration: "2-3 weeks",
                                                    priority: "CRITICAL",
                                                    tasks: [
                                                        "Set up automated daily backups to AWS S3",
                                                        "Configure incremental backups every 4 hours",
                                                        "Implement backup monitoring and alerting",
                                                        "Set up backup encryption and compression",
                                                    ],
                                                    effort: "60 hours",
                                                },
                                                {
                                                    phase: "Phase 2: Disaster Recovery Setup",
                                                    duration: "3-4 weeks",
                                                    priority: "HIGH",
                                                    tasks: [
                                                        "Develop comprehensive disaster recovery plan",
                                                        "Set up database replication to secondary region",
                                                        "Configure automated failover systems",
                                                        "Implement DR testing procedures",
                                                    ],
                                                    effort: "80 hours",
                                                },
                                                {
                                                    phase: "Phase 3: Business Continuity Planning",
                                                    duration: "2-3 weeks",
                                                    priority: "MEDIUM",
                                                    tasks: [
                                                        "Create business continuity plan document",
                                                        "Conduct business impact analysis",
                                                        "Establish alternative operation procedures",
                                                        "Set up emergency communication systems",
                                                    ],
                                                    effort: "40 hours",
                                                },
                                                {
                                                    phase: "Phase 4: Testing and Optimization",
                                                    duration: "2-3 weeks",
                                                    priority: "MEDIUM",
                                                    tasks: [
                                                        "Conduct comprehensive DR testing",
                                                        "Perform backup restoration tests",
                                                        "Optimize backup and recovery performance",
                                                        "Document all procedures and test results",
                                                    ],
                                                    effort: "50 hours",
                                                },
                                            ].map((phase, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-lg", children: phase.phase }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: `${phase.priority === "CRITICAL"
                                                                            ? "bg-red-100 text-red-800"
                                                                            : phase.priority === "HIGH"
                                                                                ? "bg-orange-100 text-orange-800"
                                                                                : "bg-yellow-100 text-yellow-800"}`, children: phase.priority }), _jsx("span", { className: "text-sm text-gray-500", children: phase.duration })] })] }), _jsx("div", { className: "space-y-2 mb-3", children: phase.tasks.map((task, taskIndex) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: task })] }, taskIndex))) }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("strong", { children: "Estimated Effort:" }), " ", phase.effort] })] }, index))) }) })] }) })] })] }) }));
};
export default BackupRecoveryDashboard;
