import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { enhancedAuthService } from "@/services/enhanced-auth.service";
import { SecurityService } from "@/services/security.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import BrandHeader from "@/components/ui/brand-header";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Loader2,
  Chrome,
  Github,
} from "lucide-react";

interface EnhancedLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({
  onSuccess,
  redirectTo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithSSO, loading } = useSupabaseAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Authentication state
  const [authStep, setAuthStep] = useState<"login" | "mfa" | "success">(
    "login",
  );
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200",
    label: "Enter password",
  });

  // Security features state
  const [deviceTrusted, setDeviceTrusted] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);

  useEffect(() => {
    initializeSecurityFeatures();
    checkDeviceTrust();
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (password) {
      evaluatePasswordStrength(password);
    } else {
      setPasswordStrength({
        score: 0,
        feedback: [],
        color: "bg-gray-200",
        label: "Enter password",
      });
    }
  }, [password]);

  /**
   * Initialize security features and device fingerprinting
   */
  const initializeSecurityFeatures = async () => {
    try {
      const securityService = SecurityService.getInstance();
      await securityService.initialize();

      // Check if CAPTCHA is required based on failed attempts
      const failedAttemptsCount = parseInt(
        localStorage.getItem("failed_login_attempts") || "0",
      );
      if (failedAttemptsCount >= 3) {
        setCaptchaRequired(true);
      }
      setFailedAttempts(failedAttemptsCount);

      // Check for account lockout
      const lockoutData = localStorage.getItem("account_lockout");
      if (lockoutData) {
        const { lockedUntil } = JSON.parse(lockoutData);
        const lockoutDate = new Date(lockedUntil);
        if (lockoutDate > new Date()) {
          setAccountLocked(true);
          setLockoutTime(lockoutDate);
        } else {
          localStorage.removeItem("account_lockout");
        }
      }
    } catch (error) {
      console.error("Failed to initialize security features:", error);
    }
  };

  /**
   * Check if current device is trusted
   */
  const checkDeviceTrust = async () => {
    try {
      const deviceId = await generateDeviceFingerprint();
      const trustedDevices = JSON.parse(
        localStorage.getItem("trusted_devices") || "[]",
      );
      setDeviceTrusted(trustedDevices.includes(deviceId));
    } catch (error) {
      console.error("Failed to check device trust:", error);
    }
  };

  /**
   * Check if biometric authentication is available
   */
  const checkBiometricAvailability = async () => {
    try {
      if ("credentials" in navigator && "create" in navigator.credentials) {
        setBiometricAvailable(true);
      }
    } catch (error) {
      console.error("Biometric check failed:", error);
    }
  };

  /**
   * Generate device fingerprint for security tracking
   */
  const generateDeviceFingerprint = async (): Promise<string> => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
    };
    return btoa(JSON.stringify(fingerprint)).substring(0, 32);
  };

  /**
   * Evaluate password strength with comprehensive criteria
   */
  const evaluatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else if (password.length >= 8) {
      score += 15;
      feedback.push("Use at least 12 characters for better security");
    } else {
      feedback.push("Password must be at least 8 characters long");
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Add uppercase letters");

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push("Add numbers");

    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push("Add special characters (!@#$%^&*)");

    // Common patterns check
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /login/i,
    ];
    if (commonPatterns.some((pattern) => pattern.test(password))) {
      score -= 20;
      feedback.push("Avoid common patterns and dictionary words");
    }

    // Sequential characters check
    if (/(..).*\1/.test(password)) {
      score -= 10;
      feedback.push("Avoid repeating character sequences");
    }

    // Determine strength level and color
    let color = "bg-red-500";
    let label = "Very Weak";

    if (score >= 80) {
      color = "bg-green-500";
      label = "Very Strong";
    } else if (score >= 60) {
      color = "bg-blue-500";
      label = "Strong";
    } else if (score >= 40) {
      color = "bg-yellow-500";
      label = "Moderate";
    } else if (score >= 20) {
      color = "bg-orange-500";
      label = "Weak";
    }

    setPasswordStrength({
      score: Math.max(0, Math.min(100, score)),
      feedback,
      color,
      label,
    });
  };

  /**
   * Handle form submission with enhanced security
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Check for account lockout
      if (accountLocked && lockoutTime && lockoutTime > new Date()) {
        const remainingTime = Math.ceil(
          (lockoutTime.getTime() - new Date().getTime()) / 1000 / 60,
        );
        setError(
          `Account is locked. Please try again in ${remainingTime} minutes.`,
        );
        return;
      }

      // Validate form inputs
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Password strength validation for new logins
      if (passwordStrength.score < 40 && !deviceTrusted) {
        setError(
          "Password does not meet security requirements. Please use a stronger password.",
        );
        return;
      }

      const deviceId = await generateDeviceFingerprint();

      // Attempt authentication with enhanced auth service
      const result = await enhancedAuthService.login({
        email,
        password,
        mfaCode: authStep === "mfa" ? mfaCode : undefined,
        deviceId,
      });

      if (result.success) {
        // Clear failed attempts on successful login
        localStorage.removeItem("failed_login_attempts");
        localStorage.removeItem("account_lockout");

        // Add device to trusted devices if remember me is checked
        if (rememberMe) {
          const trustedDevices = JSON.parse(
            localStorage.getItem("trusted_devices") || "[]",
          );
          if (!trustedDevices.includes(deviceId)) {
            trustedDevices.push(deviceId);
            localStorage.setItem(
              "trusted_devices",
              JSON.stringify(trustedDevices),
            );
          }
        }

        setAuthStep("success");

        // Redirect after successful authentication
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            const from =
              (location.state as any)?.from?.pathname ||
              redirectTo ||
              "/dashboard";
            navigate(from, { replace: true });
          }
        }, 1500);
      } else if (result.requiresMfa) {
        setMfaToken(result.mfaToken || null);
        setAuthStep("mfa");
      } else {
        // Handle failed login attempt
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        localStorage.setItem(
          "failed_login_attempts",
          newFailedAttempts.toString(),
        );

        // Implement account lockout after 5 failed attempts
        if (newFailedAttempts >= 5) {
          const lockoutUntil = new Date(
            Date.now() + 30 * 60 * 1000, // 30 minutes
          );
          localStorage.setItem(
            "account_lockout",
            JSON.stringify({ lockedUntil: lockoutUntil.toISOString() }),
          );
          setAccountLocked(true);
          setLockoutTime(lockoutUntil);
          setError(
            "Account locked due to multiple failed attempts. Please try again in 30 minutes.",
          );
        } else {
          setError(
            result.error ||
              `Login failed. ${5 - newFailedAttempts} attempts remaining.`,
          );
        }

        // Require CAPTCHA after 3 failed attempts
        if (newFailedAttempts >= 3) {
          setCaptchaRequired(true);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle SSO authentication
   */
  const handleSSOLogin = async (provider: string) => {
    try {
      setIsSubmitting(true);
      const result = await signInWithSSO(provider);

      if (!result.success) {
        setError(result.error || `Failed to authenticate with ${provider}`);
      }
      // Success handling is done via redirect
    } catch (error: any) {
      console.error(`SSO login error (${provider}):`, error);
      setError(`Failed to authenticate with ${provider}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle biometric authentication
   */
  const handleBiometricLogin = async () => {
    try {
      if (!biometricAvailable) {
        setError("Biometric authentication is not available on this device");
        return;
      }

      setIsSubmitting(true);

      // Create credential request for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Reyada Homecare Platform",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(email || "user"),
            name: email || "user@example.com",
            displayName: "Healthcare User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "direct",
        },
      });

      if (credential) {
        // In a real implementation, you would verify the credential with your backend
        console.log("Biometric authentication successful", credential);
        setAuthStep("success");
      }
    } catch (error: any) {
      console.error("Biometric authentication failed:", error);
      setError("Biometric authentication failed. Please try password login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render MFA input step
   */
  const renderMFAStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-reyada-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-reyada-primary" />
        </div>
        <h3 className="text-lg font-semibold text-reyada-neutral-900 mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-reyada-neutral-600 mb-4">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mfaCode">Authentication Code</Label>
        <Input
          id="mfaCode"
          type="text"
          value={mfaCode}
          onChange={(e) =>
            setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          className="text-center text-lg tracking-widest"
          maxLength={6}
          autoComplete="one-time-code"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-reyada-primary hover:bg-reyada-primary-dark"
        disabled={isSubmitting || mfaCode.length !== 6}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setAuthStep("login");
          setMfaCode("");
          setMfaToken(null);
        }}
      >
        Back to Login
      </Button>
    </div>
  );

  /**
   * Render success step
   */
  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Login Successful
        </h3>
        <p className="text-sm text-reyada-neutral-600">
          Redirecting to your dashboard...
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full animate-pulse w-full"></div>
      </div>
    </div>
  );

  /**
   * Render main login form
   */
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="pl-10"
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="pl-10 pr-10"
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-reyada-neutral-400 hover:text-reyada-neutral-600"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-reyada-neutral-600">Password Strength</span>
              <Badge
                variant={passwordStrength.score >= 60 ? "default" : "secondary"}
                className="text-xs"
              >
                {passwordStrength.label}
              </Badge>
            </div>
            <Progress value={passwordStrength.score} className="h-2" />
            {passwordStrength.feedback.length > 0 && (
              <ul className="text-xs text-reyada-neutral-600 space-y-1">
                {passwordStrength.feedback
                  .slice(0, 2)
                  .map((feedback, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-reyada-neutral-400 rounded-full" />
                      {feedback}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Security Features */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-reyada-neutral-300"
            disabled={isSubmitting}
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Trust this device
          </Label>
        </div>
        <button
          type="button"
          className="text-reyada-primary hover:text-reyada-primary-dark font-medium"
          onClick={() => navigate("/forgot-password")}
          disabled={isSubmitting}
        >
          Forgot password?
        </button>
      </div>

      {/* Security Status Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-reyada-neutral-500">
        {deviceTrusted && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Trusted Device</span>
          </div>
        )}
        {biometricAvailable && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-500" />
            <span>Biometric Available</span>
          </div>
        )}
        {failedAttempts > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-orange-500" />
            <span>{failedAttempts} failed attempts</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-reyada-primary hover:bg-reyada-primary-dark"
        disabled={isSubmitting || accountLocked}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {/* Biometric Login */}
      {biometricAvailable && email && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleBiometricLogin}
          disabled={isSubmitting}
        >
          <Shield className="w-4 h-4 mr-2" />
          Use Biometric Authentication
        </Button>
      )}

      {/* SSO Options */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-reyada-neutral-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSSOLogin("google")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2"
          >
            <Chrome className="w-4 h-4" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSSOLogin("microsoft")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
            </svg>
            Microsoft
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-reyada-neutral-50 to-reyada-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-reyada-neutral-200">
        <CardHeader className="text-center pb-4">
          <BrandHeader size="md" showTagline={false} showCopyright={false} />
          <CardTitle className="text-xl font-semibold text-reyada-neutral-900 mt-4">
            {authStep === "login" && "Welcome Back"}
            {authStep === "mfa" && "Verify Identity"}
            {authStep === "success" && "Access Granted"}
          </CardTitle>
          <p className="text-sm text-reyada-neutral-600">
            {authStep === "login" && "Sign in to your healthcare platform"}
            {authStep === "mfa" && "Complete two-factor authentication"}
            {authStep === "success" && "Authentication successful"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {authStep === "login" && renderLoginForm()}
          {authStep === "mfa" && renderMFAStep()}
          {authStep === "success" && renderSuccessStep()}

          {/* Footer */}
          <div className="pt-4 border-t border-reyada-neutral-200 text-center">
            <p className="text-xs text-reyada-neutral-500">
              DOH Compliant • HIPAA Secure • Multi-Factor Authentication
            </p>
            <p className="text-xs text-reyada-neutral-400 mt-1">
              © 2024 Reyada Home Health Care Services L.L.C.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLoginForm;
