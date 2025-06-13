import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wifi, WifiOff, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function OfflineBanner({ isOnline, pendingItems, isSyncing, onSyncClick, }) {
    const totalPendingItems = pendingItems.clinicalForms +
        pendingItems.patientAssessments +
        pendingItems.serviceInitiations;
    // If online and no pending items, don't show the banner
    if (isOnline && totalPendingItems === 0) {
        return null;
    }
    return (_jsxs(Alert, { className: `${isOnline ? "bg-blue-50" : "bg-amber-50"} mb-4 flex items-center justify-between`, children: [_jsxs("div", { className: "flex items-start gap-2", children: [isOnline ? (_jsx(Wifi, { className: "h-5 w-5 text-blue-600" })) : (_jsx(WifiOff, { className: "h-5 w-5 text-amber-600" })), _jsxs("div", { children: [_jsx(AlertTitle, { className: isOnline ? "text-blue-600" : "text-amber-600", children: isOnline ? "Online Mode" : "Offline Mode" }), _jsx(AlertDescription, { className: "text-sm", children: isOnline
                                    ? totalPendingItems > 0
                                        ? `You have ${totalPendingItems} item(s) pending synchronization.`
                                        : "All data is synchronized with the server."
                                    : "You are currently working offline. Changes will be saved locally and synchronized when you're back online." }), totalPendingItems > 0 && (_jsxs("div", { className: "flex gap-2 mt-2", children: [pendingItems.clinicalForms > 0 && (_jsxs(Badge, { variant: "outline", className: "bg-white", children: [pendingItems.clinicalForms, " Form(s)"] })), pendingItems.patientAssessments > 0 && (_jsxs(Badge, { variant: "outline", className: "bg-white", children: [pendingItems.patientAssessments, " Assessment(s)"] })), pendingItems.serviceInitiations > 0 && (_jsxs(Badge, { variant: "outline", className: "bg-white", children: [pendingItems.serviceInitiations, " Service(s)"] }))] }))] })] }), isOnline && totalPendingItems > 0 && (_jsxs(Button, { size: "sm", onClick: onSyncClick, disabled: isSyncing, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), isSyncing ? "Syncing..." : "Sync Now"] }))] }));
}
