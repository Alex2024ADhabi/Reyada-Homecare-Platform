import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";

interface MFAMethod {
  id: string;
  type: "sms" | "email" | "authenticator" | "backup_codes";
  name: string;
  enabled: boolean;
  verified: boolean;
  lastUsed?: string;
}

interface MFAContextType {
  isEnabled: boolean;
  methods: MFAMethod[];
  currentChallenge: string | null;
  enableMFA: (method: string) => Promise<void>;
  disableMFA: (methodId: string) => Promise<void>;
  verifyChallenge: (code: string) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[]>;
  requireMFA: boolean;
  setRequireMFA: (require: boolean) => void;
}

const MFAContext = createContext<MFAContextType | undefined>(undefined);

export const useMFA = () => {
  const context = useContext(MFAContext);
  if (!context) {
    throw new Error("useMFA must be used within an MFAProvider");
  }
  return context;
};

interface MFAProviderProps {
  children: React.ReactNode;
}

export const MFAProvider: React.FC<MFAProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [methods, setMethods] = useState<MFAMethod[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [requireMFA, setRequireMFA] = useState(false);
  const { toast } = useToastContext();

  useEffect(() => {
    loadMFASettings();
  }, []);

  const loadMFASettings = async () => {
    try {
      // In a real implementation, this would fetch from API
      const savedSettings = localStorage.getItem("mfa_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsEnabled(settings.isEnabled || false);
        setMethods(settings.methods || []);
        setRequireMFA(settings.requireMFA || false);
      } else {
        // Initialize default methods
        const defaultMethods: MFAMethod[] = [
          {
            id: "sms",
            type: "sms",
            name: "SMS Authentication",
            enabled: false,
            verified: false,
          },
          {
            id: "email",
            type: "email",
            name: "Email Authentication",
            enabled: false,
            verified: false,
          },
          {
            id: "authenticator",
            type: "authenticator",
            name: "Authenticator App",
            enabled: false,
            verified: false,
          },
          {
            id: "backup_codes",
            type: "backup_codes",
            name: "Backup Codes",
            enabled: false,
            verified: false,
          },
        ];
        setMethods(defaultMethods);
      }
    } catch (error) {
      console.error("Failed to load MFA settings:", error);
    }
  };

  const saveMFASettings = (
    newMethods: MFAMethod[],
    enabled: boolean,
    require: boolean,
  ) => {
    const settings = {
      isEnabled: enabled,
      methods: newMethods,
      requireMFA: require,
    };
    localStorage.setItem("mfa_settings", JSON.stringify(settings));
  };

  const enableMFA = async (methodType: string) => {
    try {
      const method = methods.find((m) => m.type === methodType);
      if (!method) {
        throw new Error("MFA method not found");
      }

      // Simulate API call to enable MFA method
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedMethods = methods.map((m) =>
        m.type === methodType ? { ...m, enabled: true, verified: true } : m,
      );

      setMethods(updatedMethods);
      const hasEnabledMethod = updatedMethods.some((m) => m.enabled);
      setIsEnabled(hasEnabledMethod);

      saveMFASettings(updatedMethods, hasEnabledMethod, requireMFA);

      toast({
        title: "MFA Enabled",
        description: `${method.name} has been enabled successfully`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to enable MFA:", error);
      toast({
        title: "Error",
        description: "Failed to enable MFA method",
        variant: "destructive",
      });
    }
  };

  const disableMFA = async (methodId: string) => {
    try {
      const method = methods.find((m) => m.id === methodId);
      if (!method) {
        throw new Error("MFA method not found");
      }

      // Simulate API call to disable MFA method
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedMethods = methods.map((m) =>
        m.id === methodId ? { ...m, enabled: false, verified: false } : m,
      );

      setMethods(updatedMethods);
      const hasEnabledMethod = updatedMethods.some((m) => m.enabled);
      setIsEnabled(hasEnabledMethod);

      saveMFASettings(updatedMethods, hasEnabledMethod, requireMFA);

      toast({
        title: "MFA Disabled",
        description: `${method.name} has been disabled`,
        variant: "info",
      });
    } catch (error) {
      console.error("Failed to disable MFA:", error);
      toast({
        title: "Error",
        description: "Failed to disable MFA method",
        variant: "destructive",
      });
    }
  };

  const verifyChallenge = async (code: string): Promise<boolean> => {
    try {
      // Simulate API call to verify MFA code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept any 6-digit code
      const isValid = /^\d{6}$/.test(code);

      if (isValid) {
        setCurrentChallenge(null);
        toast({
          title: "Verification Successful",
          description: "MFA code verified successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid MFA code",
          variant: "destructive",
        });
      }

      return isValid;
    } catch (error) {
      console.error("Failed to verify MFA challenge:", error);
      toast({
        title: "Error",
        description: "Failed to verify MFA code",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateBackupCodes = async (): Promise<string[]> => {
    try {
      // Simulate API call to generate backup codes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substr(2, 8).toUpperCase(),
      );

      // Enable backup codes method
      const updatedMethods = methods.map((m) =>
        m.type === "backup_codes" ? { ...m, enabled: true, verified: true } : m,
      );

      setMethods(updatedMethods);
      saveMFASettings(updatedMethods, true, requireMFA);

      toast({
        title: "Backup Codes Generated",
        description: "Please save these codes in a secure location",
        variant: "success",
      });

      return codes;
    } catch (error) {
      console.error("Failed to generate backup codes:", error);
      toast({
        title: "Error",
        description: "Failed to generate backup codes",
        variant: "destructive",
      });
      return [];
    }
  };

  const contextValue: MFAContextType = {
    isEnabled,
    methods,
    currentChallenge,
    enableMFA,
    disableMFA,
    verifyChallenge,
    generateBackupCodes,
    requireMFA,
    setRequireMFA: (require: boolean) => {
      setRequireMFA(require);
      saveMFASettings(methods, isEnabled, require);
    },
  };

  return (
    <MFAContext.Provider value={contextValue}>{children}</MFAContext.Provider>
  );
};

interface MFASetupProps {
  onComplete?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const { methods, enableMFA, disableMFA, generateBackupCodes } = useMFA();
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleGenerateBackupCodes = async () => {
    const codes = await generateBackupCodes();
    setBackupCodes(codes);
    setShowBackupCodes(true);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <Smartphone className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "authenticator":
        return <Shield className="h-5 w-5" />;
      case "backup_codes":
        return <Key className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication Setup
          </CardTitle>
          <CardDescription>
            Enhance your account security by enabling additional authentication
            methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getMethodIcon(method.type)}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">
                      {method.enabled
                        ? "Enabled and verified"
                        : "Not configured"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {method.enabled && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}

                  {method.type === "backup_codes" ? (
                    <Button
                      variant={method.enabled ? "outline" : "default"}
                      size="sm"
                      onClick={handleGenerateBackupCodes}
                    >
                      {method.enabled ? "Regenerate" : "Generate"} Codes
                    </Button>
                  ) : (
                    <Button
                      variant={method.enabled ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        method.enabled
                          ? disableMFA(method.id)
                          : enableMFA(method.type)
                      }
                    >
                      {method.enabled ? "Disable" : "Enable"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showBackupCodes && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Backup Codes Generated
            </CardTitle>
            <CardDescription>
              Save these codes in a secure location. Each code can only be used
              once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {code}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join("\n"));
                }}
                variant="outline"
              >
                Copy All Codes
              </Button>
              <Button
                onClick={() => setShowBackupCodes(false)}
                variant="outline"
              >
                I've Saved These Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {onComplete && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Complete Setup</Button>
        </div>
      )}
    </div>
  );
};

interface MFAChallengeProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const MFAChallenge: React.FC<MFAChallengeProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { verifyChallenge } = useMFA();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsVerifying(true);
    try {
      const isValid = await verifyChallenge(code);
      if (isValid) {
        onSuccess();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app or SMS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="text-center text-lg tracking-widest"
          maxLength={6}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
            className="flex-1"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MFAProvider;
