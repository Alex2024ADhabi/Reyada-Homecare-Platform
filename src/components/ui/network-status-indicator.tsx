import React from "react";
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";
import networkRecoveryService, {
  NetworkStatus,
} from "@/services/network-recovery.service";

interface NetworkStatusIndicatorProps {
  className?: string;
  showText?: boolean;
  onRecoveryClick?: () => void;
}

export default function NetworkStatusIndicator({
  className = "",
  showText = true,
  onRecoveryClick,
}: NetworkStatusIndicatorProps) {
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>(
    networkRecoveryService.getNetworkStatus(),
  );
  const [isRecovering, setIsRecovering] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = networkRecoveryService.onStatusChange((status) => {
      setNetworkStatus(status);
    });

    return unsubscribe;
  }, []);

  const handleRecoveryClick = async () => {
    if (isRecovering) return;

    setIsRecovering(true);
    try {
      await networkRecoveryService.manualRecovery();
      if (onRecoveryClick) {
        onRecoveryClick();
      }
    } catch (error) {
      console.error("Manual recovery failed:", error);
    } finally {
      setIsRecovering(false);
    }
  };

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return "text-red-500";

    switch (networkStatus.connectionQuality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-blue-500";
      case "poor":
        return "text-yellow-500";
      default:
        return "text-red-500";
    }
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }

    switch (networkStatus.connectionQuality) {
      case "excellent":
        return <CheckCircle className="w-4 h-4" />;
      case "good":
        return <Wifi className="w-4 h-4" />;
      case "poor":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return "Offline";

    switch (networkStatus.connectionQuality) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "poor":
        return "Poor";
      default:
        return "Unknown";
    }
  };

  const shouldShowRecoveryButton = () => {
    return (
      !networkStatus.isOnline ||
      networkStatus.connectionQuality === "poor" ||
      networkStatus.retryAttempts > 0
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        {showText && (
          <span className="text-sm font-medium">{getStatusText()}</span>
        )}
      </div>

      {shouldShowRecoveryButton() && (
        <button
          onClick={handleRecoveryClick}
          disabled={isRecovering}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Trigger network recovery"
        >
          {isRecovering ? "Recovering..." : "Fix"}
        </button>
      )}

      {networkStatus.retryAttempts > 0 && (
        <span className="text-xs text-gray-500">
          ({networkStatus.retryAttempts} attempts)
        </span>
      )}
    </div>
  );
}
