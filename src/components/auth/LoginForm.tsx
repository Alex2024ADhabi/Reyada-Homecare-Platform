import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Mail,
  Lock,
  User,
  Stethoscope,
  AlertCircle,
  Phone,
  CreditCard,
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SecurityService } from "@/services/security.service";
import { emiratesIdVerificationService } from "@/services/emirates-id-verification.service";
import BrandHeader from "@/components/ui/brand-header";

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { signIn, signUp, loading } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "",
    licenseNumber: "",
    department: "",
    emiratesId: "",
    phone: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.email) {
      newErrors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email address");
    }

    if (!formData.password) {
      newErrors.push("Password is required");
    } else if (formData.password.length < 8) {
      newErrors.push("Password must be at least 8 characters long");
    }

    if (activeTab === "signup") {
      if (!formData.confirmPassword) {
        newErrors.push("Please confirm your password");
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.push("Passwords do not match");
      }

      if (!formData.fullName) {
        newErrors.push("Full name is required");
      }

      if (!formData.role) {
        newErrors.push("Role is required");
      }

      if (
        ["doctor", "nurse", "therapist"].includes(formData.role) &&
        !formData.licenseNumber
      ) {
        newErrors.push(
          "License number is required for healthcare professionals",
        );
      }

      if (
        formData.emiratesId &&
        !/^\d{3}-\d{4}-\d{7}-\d{1}$/.test(formData.emiratesId)
      ) {
        newErrors.push("Emirates ID format should be XXX-XXXX-XXXXXXX-X");
      }

      if (formData.phone && !/^\+971[0-9]{8,9}$/.test(formData.phone)) {
        newErrors.push("Phone number should be in UAE format (+971XXXXXXXX)");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Enhanced security validation
      const securityService = SecurityService.getInstance();
      const inputValidation = await securityService.validateInput(
        formData.email,
        "general",
      );

      if (!inputValidation.isValid) {
        setErrors(["Invalid input detected. Please check your credentials."]);
        return;
      }

      const { success } = await signIn(formData.email, formData.password);

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setErrors(["Authentication failed. Please try again."]);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Enhanced security validation for sign up
      const securityService = SecurityService.getInstance();
      const emailValidation = await securityService.validateInput(
        formData.email,
        "general",
      );

      if (!emailValidation.isValid) {
        setErrors(["Invalid email format detected."]);
        return;
      }

      // Validate Emirates ID if provided
      if (formData.emiratesId) {
        const emiratesIdValidation =
          await emiratesIdVerificationService.validateEmiratesId(
            formData.emiratesId,
          );
        if (!emiratesIdValidation.isValid) {
          setErrors(["Invalid Emirates ID format or verification failed."]);
          return;
        }
      }

      const { success } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role as
          | "doctor"
          | "nurse"
          | "admin"
          | "therapist"
          | "coordinator",
        license_number: formData.licenseNumber || undefined,
        department: formData.department || undefined,
        emirates_id: formData.emiratesId || undefined,
        phone: formData.phone || undefined,
      });

      if (success) {
        setActiveTab("signin");
        setFormData({
          email: formData.email,
          password: "",
          confirmPassword: "",
          fullName: "",
          role: "",
          licenseNumber: "",
          department: "",
          emiratesId: "",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setErrors(["Registration failed. Please try again."]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-reyada-neutral-50 to-reyada-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-reyada-neutral-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-reyada-primary/10 to-reyada-secondary/10 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-reyada-primary" />
          </div>
          <BrandHeader size="md" showTagline showCopyright />
          <CardDescription className="text-sm text-reyada-neutral-600 mt-2">
            Secure access to the DOH-compliant healthcare platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-reyada-neutral-100">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-reyada-primary data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-reyada-primary data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {errors.length > 0 && (
              <Alert
                variant="destructive"
                className="mt-4 border-reyada-error bg-reyada-error/5"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-email"
                    className="text-reyada-neutral-700"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-reyada-neutral-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-reyada-primary hover:bg-reyada-primary-dark"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-name"
                    className="text-reyada-neutral-700"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-reyada-neutral-700"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-role"
                    className="text-reyada-neutral-700"
                  >
                    Role
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger className="border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["doctor", "nurse", "therapist"].includes(formData.role) && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-license"
                      className="text-reyada-neutral-700"
                    >
                      License Number
                    </Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                      <Input
                        id="signup-license"
                        type="text"
                        placeholder="Enter your license number"
                        className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-emirates-id"
                    className="text-reyada-neutral-700"
                  >
                    Emirates ID (Optional)
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-emirates-id"
                      type="text"
                      placeholder="XXX-XXXX-XXXXXXX-X"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.emiratesId}
                      onChange={(e) =>
                        handleInputChange("emiratesId", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-phone"
                    className="text-reyada-neutral-700"
                  >
                    Phone (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+971XXXXXXXX"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-department"
                    className="text-reyada-neutral-700"
                  >
                    Department (Optional)
                  </Label>
                  <Input
                    id="signup-department"
                    type="text"
                    placeholder="e.g., Cardiology, ICU"
                    className="border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-reyada-neutral-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-confirm-password"
                    className="text-reyada-neutral-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-reyada-neutral-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 border-reyada-neutral-300 focus:border-reyada-primary focus:ring-reyada-primary"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-reyada-primary hover:bg-reyada-primary-dark"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-reyada-neutral-600">
            <p>Secure healthcare platform with role-based access control</p>
            <p className="mt-1 text-reyada-neutral-500">
              AES-256 encryption • DOH compliant
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
