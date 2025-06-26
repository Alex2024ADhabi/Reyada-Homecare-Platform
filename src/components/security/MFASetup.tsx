// Multi-Factor Authentication Setup Component
// P1-003: Multi-Factor Authentication Implementation

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MFAService } from "@/api/supabase.api";
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  Copy,
  Download,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface MFASetupProps {
  userId: string;
  onSetupComplete?: () => void;
}

export default function MFASetup({ userId, onSetupComplete }: MFASetupProps) {
  const [activeTab, setActiveTab] = useState("totp");
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    generateTOTPSecret();
  }, []);

  const generateTOTPSecret = async () => {
    setIsLoading(true);
    setError("");

    const result = await MFAService.generateTOTPSecret(userId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setTotpSecret(result.secret || "");
      setQrCodeUrl(result.qrCodeUrl || "");
    }

    setIsLoading(false);
  };

  const verifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await MFAService.verifyTOTP(userId, verificationCode);

    if (result.error) {
      setError(result.error.message);
    } else if (result.isValid) {
      setSuccess("TOTP verification successful! MFA is now enabled.");
      setMfaEnabled(true);
      generateBackupCodes();
      onSetupComplete?.();
    } else {
      setError("Invalid verification code. Please try again.");
    }

    setIsLoading(false);
  };

  const generateBackupCodes = async () => {
    const result = await MFAService.generateBackupCodes(userId);

    if (result.error) {
      setError(result.error.message);
    } else {
      setBackupCodes(result.codes || []);
      setActiveTab("backup");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const downloadBackupCodes = () => {
    const content = `Reyada Homecare Platform - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser ID: ${userId}\n\nBackup Codes (use each code only once):\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join("\n")}\n\nKeep these codes in a safe place. You can use them to access your account if you lose access to your authenticator app.`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reyada-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Multi-Factor Authentication Setup
            </h1>
          </div>
          <p className="text-gray-600">
            Enhance your account security by enabling multi-factor
            authentication. This adds an extra layer of protection to your
            Reyada Homecare Platform account.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Authenticator App
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              SMS/Email
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Backup Codes
              {backupCodes.length > 0 && (
                <Badge variant="secondary">Ready</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Setup Authenticator App
                </CardTitle>
                <CardDescription>
                  Use an authenticator app like Google Authenticator, Authy, or
                  Microsoft Authenticator to generate time-based codes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Step 1: Scan QR Code
                      </Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Open your authenticator app and scan this QR code:
                      </p>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        {qrCodeUrl ? (
                          <div className="space-y-2">
                            <div className="w-48 h-48 bg-white mx-auto rounded border flex items-center justify-center">
                              <p className="text-sm text-gray-500">
                                QR Code would appear here
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(qrCodeUrl)}
                              className="flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Copy Setup URL
                            </Button>
                          </div>
                        ) : (
                          <div className="w-48 h-48 bg-gray-200 mx-auto rounded animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Manual Entry
                      </Label>
                      <p className="text-sm text-gray-600 mb-2">
                        If you can't scan the QR code, enter this secret
                        manually:
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={totpSecret}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(totpSecret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Step 2: Enter Verification Code
                      </Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter the 6-digit code from your authenticator app:
                      </p>
                      <div className="space-y-3">
                        <Input
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          placeholder="000000"
                          className="text-center text-lg font-mono tracking-widest"
                          maxLength={6}
                        />
                        <Button
                          onClick={verifyTOTP}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="w-full"
                        >
                          {isLoading ? "Verifying..." : "Verify & Enable MFA"}
                        </Button>
                      </div>
                    </div>

                    {mfaEnabled && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          MFA is now enabled! Make sure to save your backup
                          codes.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SMS & Email Verification
                </CardTitle>
                <CardDescription>
                  Receive verification codes via SMS or email as an alternative
                  to the authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    SMS and Email MFA will be available in the next update. For
                    now, please use the Authenticator App method.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Backup Codes
                </CardTitle>
                <CardDescription>
                  These one-time use codes can be used to access your account if
                  you lose access to your authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {backupCodes.length > 0 ? (
                  <div className="space-y-4">
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <strong>Important:</strong> Save these codes in a secure
                        location. Each code can only be used once.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <span>
                            {index + 1}. {code}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => copyToClipboard(backupCodes.join("\n"))}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy All Codes
                      </Button>
                      <Button
                        onClick={downloadBackupCodes}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download as File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Backup codes will be generated after you successfully set
                      up your authenticator app.
                    </p>
                    <Button
                      onClick={() => setActiveTab("totp")}
                      variant="outline"
                    >
                      Setup Authenticator First
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            Security Best Practices
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep your backup codes in a secure, offline location</li>
            <li>
              • Don't share your authenticator app or backup codes with anyone
            </li>
            <li>
              • If you lose your device, use a backup code to regain access
            </li>
            <li>
              • Contact your administrator if you lose access to both your
              device and backup codes
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
