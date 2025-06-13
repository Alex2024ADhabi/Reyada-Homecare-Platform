import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Shield, Clock, HardDrive, AlertTriangle, XCircle, RefreshCw, Download, Upload, Server, Activity, FileText, Settings, Play, RotateCcw, } from "lucide-react";
import { backupRecoveryService } from "@/services/backup-recovery.service";
export default function BackupRecoveryDashboard() {
    const [backupStatus, setBackupStatus] = useState({
        activeJobs: 0,
        completedToday: 0,
        failedToday: 0,
        nextScheduled: "",
        totalStorage: 0,
    });
    const [drStatus, setDRStatus] = useState({
        plansTotal: 0,
        plansReady: 0,
        lastTestDate: "",
        nextTestDate: "",
        averageRTO: 0,
        averageRPO: 0,
    });
    const [replicationStatus, setReplicationStatus] = useState({
        configurationsTotal: 0,
        configurationsHealthy: 0,
        averageLag: 0,
        lastError: "",
    });
    const [businessContinuityDoc, setBusinessContinuityDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            // Initialize backup recovery service
            await backupRecoveryService.initialize();
            // Load status data
            const backup = backupRecoveryService.getBackupStatus();
            const dr = backupRecoveryService.getDRStatus();
            const replication = backupRecoveryService.getReplicationStatus();
            const bcDoc = backupRecoveryService.generateBusinessContinuityDocumentation();
            setBackupStatus(backup);
            setDRStatus(dr);
            setReplicationStatus(replication);
            setBusinessContinuityDoc(bcDoc);
        }
        catch (error) {
            console.error("Failed to load backup recovery dashboard data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRunFullBackup = async () => {
        try {
            setIsLoading(true);
            await backupRecoveryService.executeBackup("daily-full-backup");
            await loadDashboardData();
        }
        catch (error) {
            console.error("Failed to run full backup:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRunIncrementalBackup = async () => {
        try {
            setIsLoading(true);
            await backupRecoveryService.executeBackup("incremental-backup");
            await loadDashboardData();
        }
        catch (error) {
            console.error("Failed to run incremental backup:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleTestDRPlan = async (planId) => {
        try {
            setIsLoading(true);
            await backupRecoveryService.executeDRTest(planId, "partial");
            await loadDashboardData();
        }
        catch (error) {
            console.error("Failed to test DR plan:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        return new Date(dateString).toLocaleString();
    };
    if (isLoading && !backupStatus.activeJobs) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" }), _jsx("p", { className: "text-gray-600", children: "Loading backup and recovery dashboard..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-white min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Backup & Recovery Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Comprehensive backup management, disaster recovery testing, and business continuity planning" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { onClick: handleRunIncrementalBackup, variant: "outline", disabled: isLoading, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Run Incremental Backup"] }), _jsxs(Button, { onClick: handleRunFullBackup, disabled: isLoading, children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), "Run Full Backup"] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "backups", children: "Backups" }), _jsx(TabsTrigger, { value: "disaster-recovery", children: "Disaster Recovery" }), _jsx(TabsTrigger, { value: "replication", children: "Replication" }), _jsx(TabsTrigger, { value: "documentation", children: "Documentation" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Backup Jobs" }), _jsx(Activity, { className: "h-4 w-4 text-blue-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: backupStatus.activeJobs }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [backupStatus.completedToday, " completed today"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "DR Readiness" }), _jsx(Shield, { className: "h-4 w-4 text-green-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [drStatus.plansTotal > 0
                                                                ? Math.round((drStatus.plansReady / drStatus.plansTotal) * 100)
                                                                : 0, "%"] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [drStatus.plansReady, " of ", drStatus.plansTotal, " plans ready"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Replication Health" }), _jsx(Server, { className: "h-4 w-4 text-purple-600" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [replicationStatus.configurationsTotal > 0
                                                                ? Math.round((replicationStatus.configurationsHealthy /
                                                                    replicationStatus.configurationsTotal) *
                                                                    100)
                                                                : 0, "%"] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Avg lag: ", replicationStatus.averageLag.toFixed(1), "s"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Storage Used" }), _jsx(HardDrive, { className: "h-4 w-4 text-orange-600" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatBytes(backupStatus.totalStorage) }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Next backup: ", formatDate(backupStatus.nextScheduled)] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [backupStatus.failedToday > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Backup Failures Detected" }), _jsxs(AlertDescription, { children: [backupStatus.failedToday, " backup job(s) failed today. Please review the backup logs and take corrective action."] })] })), replicationStatus.lastError && (_jsxs(Alert, { variant: "destructive", children: [_jsx(XCircle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Replication Error" }), _jsxs(AlertDescription, { children: ["Latest replication error: ", replicationStatus.lastError] })] })), drStatus.plansReady < drStatus.plansTotal && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "DR Plans Need Testing" }), _jsxs(AlertDescription, { children: [drStatus.plansTotal - drStatus.plansReady, " disaster recovery plan(s) require testing to ensure readiness."] })] }))] })] }), _jsxs(TabsContent, { value: "backups", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Database, { className: "h-5 w-5 mr-2" }), "Backup Status"] }), _jsx(CardDescription, { children: "Current backup job status and recent activity" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Active Jobs" }), _jsx(Badge, { variant: backupStatus.activeJobs > 0 ? "default" : "secondary", children: backupStatus.activeJobs })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Completed Today" }), _jsx(Badge, { variant: "outline", children: backupStatus.completedToday })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Failed Today" }), _jsx(Badge, { variant: backupStatus.failedToday > 0 ? "destructive" : "outline", children: backupStatus.failedToday })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Next Scheduled Backup" }), _jsx("span", { className: "text-gray-600", children: formatDate(backupStatus.nextScheduled) })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Total Storage Used" }), _jsx("span", { className: "text-gray-600", children: formatBytes(backupStatus.totalStorage) })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Settings, { className: "h-5 w-5 mr-2" }), "Backup Configuration"] }), _jsx(CardDescription, { children: "Automated backup procedures and retention policies" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Full Backup Schedule" }), _jsx(Badge, { variant: "outline", children: "Daily at 2:00 AM" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Incremental Backup" }), _jsx(Badge, { variant: "outline", children: "Every 6 hours" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Retention Policy" }), _jsx(Badge, { variant: "outline", children: "7D/4W/12M/3Y" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Encryption" }), _jsx(Badge, { variant: "default", children: "AES-256-GCM" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Compression" }), _jsx(Badge, { variant: "default", children: "Level 6" })] })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Actions" }), _jsx(CardDescription, { children: "Manually trigger backup operations and maintenance tasks" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Button, { onClick: handleRunFullBackup, disabled: isLoading, className: "w-full", children: [_jsx(Database, { className: "h-4 w-4 mr-2" }), "Run Full Backup"] }), _jsxs(Button, { onClick: handleRunIncrementalBackup, variant: "outline", disabled: isLoading, className: "w-full", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Run Incremental Backup"] }), _jsxs(Button, { variant: "outline", disabled: isLoading, className: "w-full", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download Backup Report"] })] }) })] })] }), _jsxs(TabsContent, { value: "disaster-recovery", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2" }), "DR Plan Status"] }), _jsx(CardDescription, { children: "Disaster recovery plan readiness and testing status" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Total DR Plans" }), _jsx(Badge, { variant: "outline", children: drStatus.plansTotal })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Plans Ready" }), _jsx(Badge, { variant: drStatus.plansReady === drStatus.plansTotal
                                                                            ? "default"
                                                                            : "destructive", children: drStatus.plansReady })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last Test" }), _jsx("span", { className: "text-sm text-gray-600", children: formatDate(drStatus.lastTestDate) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Next Test" }), _jsx("span", { className: "text-sm text-gray-600", children: formatDate(drStatus.nextTestDate) })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Average RTO" }), _jsxs("span", { className: "text-gray-600", children: [drStatus.averageRTO.toFixed(1), " hours"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: "Average RPO" }), _jsxs("span", { className: "text-gray-600", children: [drStatus.averageRPO.toFixed(1), " minutes"] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Clock, { className: "h-5 w-5 mr-2" }), "Recovery Objectives"] }), _jsx(CardDescription, { children: "Recovery time and point objectives for critical systems" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Critical Systems RTO" }), _jsx("span", { className: "text-sm text-gray-600", children: "Target: 1 hour" })] }), _jsx(Progress, { value: 85, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Current: 51 minutes (85% of target)" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Recovery RPO" }), _jsx("span", { className: "text-sm text-gray-600", children: "Target: 15 minutes" })] }), _jsx(Progress, { value: 92, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Current: 13.8 minutes (92% of target)" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Full System Recovery" }), _jsx("span", { className: "text-sm text-gray-600", children: "Target: 4 hours" })] }), _jsx(Progress, { value: 78, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Current: 3.1 hours (78% of target)" })] })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DR Testing Actions" }), _jsx(CardDescription, { children: "Execute disaster recovery tests and simulations" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Button, { onClick: () => handleTestDRPlan("critical-system-recovery"), disabled: isLoading, className: "w-full", children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Test Critical Systems DR"] }), _jsxs(Button, { onClick: () => handleTestDRPlan("datacenter-failure-recovery"), variant: "outline", disabled: isLoading, className: "w-full", children: [_jsx(RotateCcw, { className: "h-4 w-4 mr-2" }), "Test Data Center Failover"] }), _jsxs(Button, { variant: "outline", disabled: isLoading, className: "w-full", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Generate DR Report"] })] }) })] })] }), _jsx(TabsContent, { value: "replication", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Server, { className: "h-5 w-5 mr-2" }), "Replication Status"] }), _jsx(CardDescription, { children: "Real-time data replication and failover system status" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Configurations" }), _jsx(Badge, { variant: "outline", children: replicationStatus.configurationsTotal })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Healthy Configurations" }), _jsx(Badge, { variant: replicationStatus.configurationsHealthy ===
                                                                        replicationStatus.configurationsTotal
                                                                        ? "default"
                                                                        : "destructive", children: replicationStatus.configurationsHealthy })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Average Lag" }), _jsxs(Badge, { variant: replicationStatus.averageLag < 10
                                                                        ? "default"
                                                                        : "destructive", children: [replicationStatus.averageLag.toFixed(1), "s"] })] })] }), _jsx(Separator, {}), replicationStatus.lastError && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded-md", children: [_jsx("p", { className: "text-sm text-red-800 font-medium", children: "Last Error:" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: replicationStatus.lastError })] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Activity, { className: "h-5 w-5 mr-2" }), "Failover Configuration"] }), _jsx(CardDescription, { children: "Automatic failover system configuration and monitoring" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Automatic Failover" }), _jsx(Badge, { variant: "default", children: "Enabled" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Health Check Interval" }), _jsx(Badge, { variant: "outline", children: "30 seconds" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Failure Threshold" }), _jsx(Badge, { variant: "outline", children: "3 consecutive failures" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last Failover Test" }), _jsx("span", { className: "text-sm text-gray-600", children: "Never" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "documentation", className: "space-y-6", children: businessContinuityDoc && (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Business Continuity Plan"] }), _jsx(CardDescription, { children: "Comprehensive business continuity documentation and procedures" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsxs("div", { className: "space-y-4 text-sm", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Executive Summary" }), _jsx("p", { className: "text-gray-700 whitespace-pre-line", children: businessContinuityDoc.executiveSummary })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Risk Assessment" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-red-700", children: "High Risk Items" }), _jsx("ul", { className: "list-disc list-inside space-y-1 mt-1", children: businessContinuityDoc.riskAssessment.highRisk.map((risk, index) => (_jsxs("li", { className: "text-gray-700", children: [_jsxs("strong", { children: [risk.risk, ":"] }), " ", risk.impact, " ", "- ", risk.mitigation] }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-yellow-700", children: "Medium Risk Items" }), _jsx("ul", { className: "list-disc list-inside space-y-1 mt-1", children: businessContinuityDoc.riskAssessment.mediumRisk.map((risk, index) => (_jsxs("li", { className: "text-gray-700", children: [_jsxs("strong", { children: [risk.risk, ":"] }), " ", risk.impact, " ", "- ", risk.mitigation] }, index))) })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Recovery Strategies" }), _jsx("div", { className: "space-y-3", children: Object.entries(businessContinuityDoc.recoveryStrategies).map(([key, strategy]) => (_jsxs("div", { children: [_jsxs("h5", { className: "font-medium capitalize", children: [key.replace(/([A-Z])/g, " $1").trim(), " (", strategy.timeframe, ")"] }), _jsx("ul", { className: "list-disc list-inside space-y-1 mt-1", children: strategy.actions.map((action, index) => (_jsx("li", { className: "text-gray-700", children: action }, index))) })] }, key))) })] })] }) }) })] }) })) })] })] }));
}
