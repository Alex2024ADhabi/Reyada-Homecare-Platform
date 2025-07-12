import { AlertCircle, Wifi, WifiOff, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfflineBannerProps {
  isOnline: boolean;
  pendingItems: {
    clinicalForms: number;
    patientAssessments: number;
    serviceInitiations: number;
  };
  isSyncing: boolean;
  onSyncClick: () => void;
}

export function OfflineBanner({
  isOnline,
  pendingItems,
  isSyncing,
  onSyncClick,
}: OfflineBannerProps) {
  const totalPendingItems =
    pendingItems.clinicalForms +
    pendingItems.patientAssessments +
    pendingItems.serviceInitiations;

  // If online and no pending items, don't show the banner
  if (isOnline && totalPendingItems === 0) {
    return null;
  }

  return (
    <Alert
      className={`${isOnline ? "bg-blue-50" : "bg-amber-50"} mb-4 flex items-center justify-between`}
    >
      <div className="flex items-start gap-2">
        {isOnline ? (
          <Wifi className="h-5 w-5 text-blue-600" />
        ) : (
          <WifiOff className="h-5 w-5 text-amber-600" />
        )}
        <div>
          <AlertTitle className={isOnline ? "text-blue-600" : "text-amber-600"}>
            {isOnline ? "Online Mode" : "Offline Mode"}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {isOnline
              ? totalPendingItems > 0
                ? `You have ${totalPendingItems} item(s) pending synchronization.`
                : "All data is synchronized with the server."
              : "You are currently working offline. Changes will be saved locally and synchronized when you're back online."}
          </AlertDescription>
          {totalPendingItems > 0 && (
            <div className="flex gap-2 mt-2">
              {pendingItems.clinicalForms > 0 && (
                <Badge variant="outline" className="bg-white">
                  {pendingItems.clinicalForms} Form(s)
                </Badge>
              )}
              {pendingItems.patientAssessments > 0 && (
                <Badge variant="outline" className="bg-white">
                  {pendingItems.patientAssessments} Assessment(s)
                </Badge>
              )}
              {pendingItems.serviceInitiations > 0 && (
                <Badge variant="outline" className="bg-white">
                  {pendingItems.serviceInitiations} Service(s)
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      {isOnline && totalPendingItems > 0 && (
        <Button
          size="sm"
          onClick={onSyncClick}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </Alert>
  );
}
