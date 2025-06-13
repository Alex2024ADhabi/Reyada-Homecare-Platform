import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Database, Download, Upload, Shield, Clock, CheckCircle, AlertTriangle, HardDrive, Cloud, } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToastContext } from "@/components/ui/toast-provider";
export const DataBackup = ({ className }) => {
    const { toast } = useToastContext();
    const [backups, setBackups] = useState([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
    const [backupFrequency, setBackupFrequency] = useState("daily");
    useEffect(() => {
        loadBackupHistory();
        checkAutoBackupSchedule();
    }, []);
    const loadBackupHistory = () => {
        try {
            const storedBackups = localStorage.getItem("backup_history");
            if (storedBackups) {
                const parsedBackups = JSON.parse(storedBackups).map((backup) => ({
                    ...backup,
                    timestamp: new Date(backup.timestamp),
                }));
                setBackups(parsedBackups);
            }
            else {
                // Generate sample backup history
                const sampleBackups = generateSampleBackups();
                setBackups(sampleBackups);
                localStorage.setItem("backup_history", JSON.stringify(sampleBackups));
            }
        }
        catch (error) {
            console.error("Failed to load backup history:", error);
        }
    };
    const generateSampleBackups = () => {
        const backups = [];
        const now = new Date();
        for (let i = 0; i < 10; i++) {
            const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            backups.push({
                id: `backup_${i + 1}`,
                timestamp,
                type: i === 0 ? "manual" : "automatic",
                size: Math.floor(Math.random() * 50 + 10) * 1024 * 1024, // 10-60 MB
                status: Math.random() > 0.1 ? "completed" : "failed",
                description: `${i === 0 ? "Manual" : "Scheduled"} backup - ${timestamp.toLocaleDateString()}`,
                encrypted: true,
            });
        }
        return backups;
    };
    const checkAutoBackupSchedule = () => {
        const lastBackup = localStorage.getItem("last_backup_time");
        const autoBackupSetting = localStorage.getItem("auto_backup_enabled");
        setAutoBackupEnabled(autoBackupSetting !== "false");
        if (autoBackupSetting !== "false" && lastBackup) {
            const lastBackupTime = new Date(lastBackup);
            const now = new Date();
            const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);
            // Auto backup if more than 24 hours since last backup
            if (hoursSinceLastBackup > 24) {
                performBackup("automatic");
            }
        }
    };
    const performBackup = async (type = "manual") => {
        setIsBackingUp(true);
        setBackupProgress(0);
        try {
            // Simulate backup process
            const steps = [
                "Preparing data...",
                "Compressing files...",
                "Encrypting backup...",
                "Uploading to secure storage...",
                "Verifying backup integrity...",
            ];
            for (let i = 0; i < steps.length; i++) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setBackupProgress(((i + 1) / steps.length) * 100);
            }
            // Create new backup entry
            const newBackup = {
                id: `backup_${Date.now()}`,
                timestamp: new Date(),
                type,
                size: Math.floor(Math.random() * 50 + 20) * 1024 * 1024, // 20-70 MB
                status: "completed",
                description: `${type === "manual" ? "Manual" : "Automatic"} backup - ${new Date().toLocaleDateString()}`,
                encrypted: true,
            };
            const updatedBackups = [newBackup, ...backups].slice(0, 20); // Keep last 20 backups
            setBackups(updatedBackups);
            localStorage.setItem("backup_history", JSON.stringify(updatedBackups));
            localStorage.setItem("last_backup_time", new Date().toISOString());
            toast({
                title: "Backup Completed",
                description: `${type === "manual" ? "Manual" : "Automatic"} backup completed successfully`,
                variant: "success",
            });
        }
        catch (error) {
            console.error("Backup failed:", error);
            toast({
                title: "Backup Failed",
                description: "An error occurred during the backup process",
                variant: "destructive",
            });
        }
        finally {
            setIsBackingUp(false);
            setBackupProgress(0);
        }
    };
    const restoreBackup = async (backupId) => {
        const backup = backups.find((b) => b.id === backupId);
        if (!backup)
            return;
        setIsRestoring(true);
        try {
            // Simulate restore process
            await new Promise((resolve) => setTimeout(resolve, 3000));
            toast({
                title: "Restore Completed",
                description: `Data restored from backup: ${backup.description}`,
                variant: "success",
            });
        }
        catch (error) {
            console.error("Restore failed:", error);
            toast({
                title: "Restore Failed",
                description: "An error occurred during the restore process",
                variant: "destructive",
            });
        }
        finally {
            setIsRestoring(false);
        }
    };
    const downloadBackup = (backup) => {
        // Simulate backup download
        const backupData = {
            id: backup.id,
            timestamp: backup.timestamp,
            data: "[Encrypted backup data would be here]",
            metadata: {
                size: backup.size,
                encrypted: backup.encrypted,
                description: backup.description,
            },
        };
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup_${backup.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({
            title: "Download Started",
            description: "Backup file download has started",
            variant: "success",
        });
    };
    const toggleAutoBackup = (enabled) => {
        setAutoBackupEnabled(enabled);
        localStorage.setItem("auto_backup_enabled", enabled.toString());
        toast({
            title: enabled ? "Auto Backup Enabled" : "Auto Backup Disabled",
            description: enabled
                ? "Automatic backups will run according to schedule"
                : "Only manual backups will be performed",
            variant: "success",
        });
    };
    const formatSize = (bytes) => {
        if (bytes === 0)
            return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "failed":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case "in-progress":
                return _jsx(Clock, { className: "h-4 w-4 text-blue-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "failed":
                return "bg-red-100 text-red-800";
            case "in-progress":
                return "bg-blue-100 text-blue-800";
        }
    };
    const lastSuccessfulBackup = backups.find((b) => b.status === "completed");
    const totalBackupSize = backups
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.size, 0);
    return (_jsx("div", { className: cn("space-y-6", className), children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), "Data Backup & Recovery"] }), _jsx(CardDescription, { children: "Secure backup and restore functionality for your data" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: autoBackupEnabled ? "default" : "secondary", children: ["Auto Backup: ", autoBackupEnabled ? "ON" : "OFF"] }), _jsx(Button, { onClick: () => performBackup("manual"), disabled: isBackingUp || isRestoring, children: isBackingUp ? "Backing Up..." : "Create Backup" })] })] }) }), _jsxs(CardContent, { children: [isBackingUp && (_jsxs("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Database, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "font-medium text-blue-800", children: "Creating Backup..." })] }), _jsx(Progress, { value: backupProgress, className: "h-2" }), _jsxs("div", { className: "text-sm text-blue-600 mt-1", children: [backupProgress.toFixed(0), "% complete"] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: backups.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Backups" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: backups.filter((b) => b.status === "completed").length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Successful" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: formatSize(totalBackupSize) }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Size" })] }), _jsxs("div", { className: "text-center p-4 bg-muted rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: lastSuccessfulBackup
                                                ? formatDistanceToNow(lastSuccessfulBackup.timestamp, {
                                                    addSuffix: true,
                                                })
                                                : "Never" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Last Backup" })] })] }), _jsxs("div", { className: "mb-6 p-4 border rounded-lg", children: [_jsxs("h4", { className: "font-medium mb-3 flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), "Backup Settings"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Automatic Backups" }), _jsx(Button, { variant: autoBackupEnabled ? "default" : "outline", size: "sm", onClick: () => toggleAutoBackup(!autoBackupEnabled), children: autoBackupEnabled ? "Enabled" : "Disabled" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Backup Frequency" }), _jsxs(Select, { value: backupFrequency, onValueChange: setBackupFrequency, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "hourly", children: "Hourly" }), _jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" })] })] })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4" }), "Backup History"] }), backups.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Database, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No backups found. Create your first backup to get started." })] })) : (_jsx("div", { className: "space-y-2", children: backups.map((backup) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(backup.status), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: backup.description }), _jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-4", children: [_jsx("span", { children: formatDistanceToNow(backup.timestamp, {
                                                                            addSuffix: true,
                                                                        }) }), _jsx("span", { children: formatSize(backup.size) }), _jsxs("span", { className: "flex items-center gap-1", children: [backup.type === "manual" ? (_jsx(HardDrive, { className: "h-3 w-3" })) : (_jsx(Cloud, { className: "h-3 w-3" })), backup.type] }), backup.encrypted && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Shield, { className: "h-3 w-3" }), "Encrypted"] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(backup.status), children: backup.status }), backup.status === "completed" && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadBackup(backup), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => restoreBackup(backup.id), disabled: isRestoring, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), isRestoring ? "Restoring..." : "Restore"] })] }))] })] }, backup.id))) }))] })] })] }) }));
};
export default DataBackup;
