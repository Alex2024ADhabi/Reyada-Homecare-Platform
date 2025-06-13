import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Mail, Key, CheckCircle, AlertCircle, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
const MFAContext = createContext(undefined);
export const useMFA = () => {
    const context = useContext(MFAContext);
    if (!context) {
        throw new Error("useMFA must be used within an MFAProvider");
    }
    return context;
};
export const MFAProvider = ({ children }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [methods, setMethods] = useState([]);
    const [currentChallenge, setCurrentChallenge] = useState(null);
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
            }
            else {
                // Initialize default methods
                const defaultMethods = [
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
        }
        catch (error) {
            console.error("Failed to load MFA settings:", error);
        }
    };
    const saveMFASettings = (newMethods, enabled, require) => {
        const settings = {
            isEnabled: enabled,
            methods: newMethods,
            requireMFA: require,
        };
        localStorage.setItem("mfa_settings", JSON.stringify(settings));
    };
    const enableMFA = async (methodType) => {
        try {
            const method = methods.find((m) => m.type === methodType);
            if (!method) {
                throw new Error("MFA method not found");
            }
            // Simulate API call to enable MFA method
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const updatedMethods = methods.map((m) => m.type === methodType ? { ...m, enabled: true, verified: true } : m);
            setMethods(updatedMethods);
            const hasEnabledMethod = updatedMethods.some((m) => m.enabled);
            setIsEnabled(hasEnabledMethod);
            saveMFASettings(updatedMethods, hasEnabledMethod, requireMFA);
            toast({
                title: "MFA Enabled",
                description: `${method.name} has been enabled successfully`,
                variant: "success",
            });
        }
        catch (error) {
            console.error("Failed to enable MFA:", error);
            toast({
                title: "Error",
                description: "Failed to enable MFA method",
                variant: "destructive",
            });
        }
    };
    const disableMFA = async (methodId) => {
        try {
            const method = methods.find((m) => m.id === methodId);
            if (!method) {
                throw new Error("MFA method not found");
            }
            // Simulate API call to disable MFA method
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const updatedMethods = methods.map((m) => m.id === methodId ? { ...m, enabled: false, verified: false } : m);
            setMethods(updatedMethods);
            const hasEnabledMethod = updatedMethods.some((m) => m.enabled);
            setIsEnabled(hasEnabledMethod);
            saveMFASettings(updatedMethods, hasEnabledMethod, requireMFA);
            toast({
                title: "MFA Disabled",
                description: `${method.name} has been disabled`,
                variant: "info",
            });
        }
        catch (error) {
            console.error("Failed to disable MFA:", error);
            toast({
                title: "Error",
                description: "Failed to disable MFA method",
                variant: "destructive",
            });
        }
    };
    const verifyChallenge = async (code) => {
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
            }
            else {
                toast({
                    title: "Verification Failed",
                    description: "Invalid MFA code",
                    variant: "destructive",
                });
            }
            return isValid;
        }
        catch (error) {
            console.error("Failed to verify MFA challenge:", error);
            toast({
                title: "Error",
                description: "Failed to verify MFA code",
                variant: "destructive",
            });
            return false;
        }
    };
    const generateBackupCodes = async () => {
        try {
            // Simulate API call to generate backup codes
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const codes = Array.from({ length: 10 }, () => Math.random().toString(36).substr(2, 8).toUpperCase());
            // Enable backup codes method
            const updatedMethods = methods.map((m) => m.type === "backup_codes" ? { ...m, enabled: true, verified: true } : m);
            setMethods(updatedMethods);
            saveMFASettings(updatedMethods, true, requireMFA);
            toast({
                title: "Backup Codes Generated",
                description: "Please save these codes in a secure location",
                variant: "success",
            });
            return codes;
        }
        catch (error) {
            console.error("Failed to generate backup codes:", error);
            toast({
                title: "Error",
                description: "Failed to generate backup codes",
                variant: "destructive",
            });
            return [];
        }
    };
    const contextValue = {
        isEnabled,
        methods,
        currentChallenge,
        enableMFA,
        disableMFA,
        verifyChallenge,
        generateBackupCodes,
        requireMFA,
        setRequireMFA: (require) => {
            setRequireMFA(require);
            saveMFASettings(methods, isEnabled, require);
        },
    };
    return (_jsx(MFAContext.Provider, { value: contextValue, children: children }));
};
export const MFASetup = ({ onComplete }) => {
    const { methods, enableMFA, disableMFA, generateBackupCodes } = useMFA();
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const handleGenerateBackupCodes = async () => {
        const codes = await generateBackupCodes();
        setBackupCodes(codes);
        setShowBackupCodes(true);
    };
    const getMethodIcon = (type) => {
        switch (type) {
            case "sms":
                return _jsx(Smartphone, { className: "h-5 w-5" });
            case "email":
                return _jsx(Mail, { className: "h-5 w-5" });
            case "authenticator":
                return _jsx(Shield, { className: "h-5 w-5" });
            case "backup_codes":
                return _jsx(Key, { className: "h-5 w-5" });
            default:
                return _jsx(Shield, { className: "h-5 w-5" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Multi-Factor Authentication Setup"] }), _jsx(CardDescription, { children: "Enhance your account security by enabling additional authentication methods" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: methods.map((method) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getMethodIcon(method.type), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: method.name }), _jsx("div", { className: "text-sm text-gray-500", children: method.enabled
                                                            ? "Enabled and verified"
                                                            : "Not configured" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [method.enabled && (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { className: "h-3 w-3" }), "Active"] })), method.type === "backup_codes" ? (_jsxs(Button, { variant: method.enabled ? "outline" : "default", size: "sm", onClick: handleGenerateBackupCodes, children: [method.enabled ? "Regenerate" : "Generate", " Codes"] })) : (_jsx(Button, { variant: method.enabled ? "outline" : "default", size: "sm", onClick: () => method.enabled
                                                    ? disableMFA(method.id)
                                                    : enableMFA(method.type), children: method.enabled ? "Disable" : "Enable" }))] })] }, method.id))) }) })] }), showBackupCodes && backupCodes.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-amber-600", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), "Backup Codes Generated"] }), _jsx(CardDescription, { children: "Save these codes in a secure location. Each code can only be used once." })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm", children: backupCodes.map((code, index) => (_jsx("div", { className: "p-2 bg-white rounded border", children: code }, index))) }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx(Button, { onClick: () => {
                                            navigator.clipboard.writeText(backupCodes.join("\n"));
                                        }, variant: "outline", children: "Copy All Codes" }), _jsx(Button, { onClick: () => setShowBackupCodes(false), variant: "outline", children: "I've Saved These Codes" })] })] })] })), onComplete && (_jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: onComplete, children: "Complete Setup" }) }))] }));
};
export const MFAChallenge = ({ onSuccess, onCancel, }) => {
    const { verifyChallenge } = useMFA();
    const [code, setCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const handleVerify = async () => {
        if (code.length !== 6)
            return;
        setIsVerifying(true);
        try {
            const isValid = await verifyChallenge(code);
            if (isValid) {
                onSuccess();
            }
        }
        finally {
            setIsVerifying(false);
        }
    };
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Two-Factor Authentication"] }), _jsx(CardDescription, { children: "Enter the 6-digit code from your authenticator app or SMS" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Input, { type: "text", placeholder: "000000", value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)), className: "text-center text-lg tracking-widest", maxLength: 6 }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleVerify, disabled: code.length !== 6 || isVerifying, className: "flex-1", children: isVerifying ? "Verifying..." : "Verify" }), onCancel && (_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }))] })] })] }));
};
export default MFAProvider;
