import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Shield, Mail, Lock, User, Stethoscope, AlertCircle, } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
const LoginForm = ({ onSuccess }) => {
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
    });
    const [errors, setErrors] = useState([]);
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear errors when user starts typing
        if (errors.length > 0) {
            setErrors([]);
        }
    };
    const validateForm = () => {
        const newErrors = [];
        if (!formData.email) {
            newErrors.push("Email is required");
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.push("Please enter a valid email address");
        }
        if (!formData.password) {
            newErrors.push("Password is required");
        }
        else if (formData.password.length < 8) {
            newErrors.push("Password must be at least 8 characters long");
        }
        if (activeTab === "signup") {
            if (!formData.confirmPassword) {
                newErrors.push("Please confirm your password");
            }
            else if (formData.password !== formData.confirmPassword) {
                newErrors.push("Passwords do not match");
            }
            if (!formData.fullName) {
                newErrors.push("Full name is required");
            }
            if (!formData.role) {
                newErrors.push("Role is required");
            }
            if (["doctor", "nurse", "therapist"].includes(formData.role) &&
                !formData.licenseNumber) {
                newErrors.push("License number is required for healthcare professionals");
            }
        }
        setErrors(newErrors);
        return newErrors.length === 0;
    };
    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        const { success } = await signIn(formData.email, formData.password);
        if (success && onSuccess) {
            onSuccess();
        }
    };
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        const { success } = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            role: formData.role,
            license_number: formData.licenseNumber || undefined,
            department: formData.department || undefined,
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
            });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Shield, { className: "h-6 w-6 text-blue-600" }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "Reyada Homecare" }), _jsx(CardDescription, { children: "Secure access to the healthcare platform" })] }), _jsxs(CardContent, { children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "signin", children: "Sign In" }), _jsx(TabsTrigger, { value: "signup", children: "Sign Up" })] }), errors.length > 0 && (_jsxs(Alert, { variant: "destructive", className: "mt-4", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsx("ul", { className: "list-disc list-inside space-y-1", children: errors.map((error, index) => (_jsx("li", { children: error }, index))) }) })] })), _jsx(TabsContent, { value: "signin", className: "space-y-4 mt-4", children: _jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signin-email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signin-email", type: "email", placeholder: "Enter your email", className: "pl-10", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signin-password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signin-password", type: "password", placeholder: "Enter your password", className: "pl-10", value: formData.password, onChange: (e) => handleInputChange("password", e.target.value), disabled: loading })] })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in..." : "Sign In" })] }) }), _jsx(TabsContent, { value: "signup", className: "space-y-4 mt-4", children: _jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-name", children: "Full Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signup-name", type: "text", placeholder: "Enter your full name", className: "pl-10", value: formData.fullName, onChange: (e) => handleInputChange("fullName", e.target.value), disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-email", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signup-email", type: "email", placeholder: "Enter your email", className: "pl-10", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-role", children: "Role" }), _jsxs(Select, { value: formData.role, onValueChange: (value) => handleInputChange("role", value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select your role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "doctor", children: "Doctor" }), _jsx(SelectItem, { value: "nurse", children: "Nurse" }), _jsx(SelectItem, { value: "therapist", children: "Therapist" }), _jsx(SelectItem, { value: "admin", children: "Administrator" })] })] })] }), ["doctor", "nurse", "therapist"].includes(formData.role) && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-license", children: "License Number" }), _jsxs("div", { className: "relative", children: [_jsx(Stethoscope, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signup-license", type: "text", placeholder: "Enter your license number", className: "pl-10", value: formData.licenseNumber, onChange: (e) => handleInputChange("licenseNumber", e.target.value), disabled: loading })] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-department", children: "Department (Optional)" }), _jsx(Input, { id: "signup-department", type: "text", placeholder: "e.g., Cardiology, ICU", value: formData.department, onChange: (e) => handleInputChange("department", e.target.value), disabled: loading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signup-password", type: "password", placeholder: "Create a password", className: "pl-10", value: formData.password, onChange: (e) => handleInputChange("password", e.target.value), disabled: loading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "signup-confirm-password", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx(Input, { id: "signup-confirm-password", type: "password", placeholder: "Confirm your password", className: "pl-10", value: formData.confirmPassword, onChange: (e) => handleInputChange("confirmPassword", e.target.value), disabled: loading })] })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating account..." : "Create Account" })] }) })] }), _jsxs("div", { className: "mt-6 text-center text-sm text-gray-600", children: [_jsx("p", { children: "Secure healthcare platform with role-based access control" }), _jsx("p", { className: "mt-1", children: "AES-256 encryption \u2022 DOH compliant" })] })] })] }) }));
};
export default LoginForm;
