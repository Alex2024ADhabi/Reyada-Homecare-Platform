import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Database, Users, FileText, Shield, Zap, Activity, } from "lucide-react";
import { supabase, PatientService } from "@/api/supabase.api";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LoginForm from "@/components/auth/LoginForm";
const SupabaseIntegrationStoryboard = () => {
    const { user, userProfile, loading, signOut } = useSupabaseAuth();
    const [connectionStatus, setConnectionStatus] = useState("checking");
    const [testResults, setTestResults] = useState({
        auth: false,
        database: false,
        realtime: false,
        storage: false,
    });
    const [progress, setProgress] = useState(0);
    const [patients, setPatients] = useState([]);
    const [testLogs, setTestLogs] = useState([]);
    const addLog = (message) => {
        setTestLogs((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
    };
    useEffect(() => {
        if (!loading) {
            runIntegrationTests();
        }
    }, [loading, user]);
    const runIntegrationTests = async () => {
        addLog("Starting Supabase integration tests...");
        setProgress(10);
        // Test 1: Connection
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("count")
                .limit(1);
            if (!error) {
                setConnectionStatus("connected");
                addLog("✅ Database connection successful");
                setTestResults((prev) => ({ ...prev, database: true }));
            }
            else {
                throw error;
            }
        }
        catch (error) {
            setConnectionStatus("error");
            addLog(`❌ Database connection failed: ${error}`);
        }
        setProgress(30);
        // Test 2: Authentication
        if (user) {
            addLog("✅ Authentication working");
            setTestResults((prev) => ({ ...prev, auth: true }));
        }
        else {
            addLog("⚠️ No authenticated user");
        }
        setProgress(50);
        // Test 3: Patient data loading
        try {
            const { data, error } = await PatientService.searchPatients("", {
                limit: 5,
            });
            if (!error && data) {
                setPatients(data);
                addLog(`✅ Loaded ${data.length} patients from database`);
            }
            else {
                addLog(`⚠️ No patients found or error: ${error?.message}`);
            }
        }
        catch (error) {
            addLog(`❌ Patient loading failed: ${error}`);
        }
        setProgress(70);
        // Test 4: Real-time subscription
        try {
            const channel = supabase
                .channel("test-channel")
                .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => {
                addLog("✅ Real-time subscription working");
                setTestResults((prev) => ({ ...prev, realtime: true }));
            })
                .subscribe();
            setTimeout(() => {
                supabase.removeChannel(channel);
            }, 2000);
        }
        catch (error) {
            addLog(`❌ Real-time test failed: ${error}`);
        }
        setProgress(90);
        // Test 5: Storage (basic check)
        try {
            const { data } = supabase.storage.from("documents").getPublicUrl("test");
            if (data?.publicUrl) {
                addLog("✅ Storage service accessible");
                setTestResults((prev) => ({ ...prev, storage: true }));
            }
        }
        catch (error) {
            addLog(`⚠️ Storage test skipped: ${error}`);
        }
        setProgress(100);
        addLog("Integration tests completed!");
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2", children: "Loading authentication..." })] }) }) }) }));
    }
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Supabase Integration Demo" }), _jsx("p", { className: "text-gray-600", children: "Please sign in to test the Supabase integration" })] }), _jsx(LoginForm, { onSuccess: () => window.location.reload() })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "container mx-auto max-w-6xl", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Supabase Integration Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Real-time testing and monitoring of Supabase services" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Badge, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-4 w-4" }), connectionStatus === "connected" ? "Connected" : "Checking..."] }), _jsx(Button, { variant: "outline", onClick: signOut, children: "Sign Out" })] })] }) }), _jsxs(Card, { className: "mb-6", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "Current User"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Email" }), _jsx("p", { className: "font-medium", children: user.email })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Role" }), _jsx("p", { className: "font-medium", children: userProfile?.role || "Loading..." })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Full Name" }), _jsx("p", { className: "font-medium", children: userProfile?.full_name || "Loading..." })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-5 w-5" }), "Integration Tests"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Overall Progress" }), _jsxs("span", { children: [progress, "%"] })] }), _jsx(Progress, { value: progress, className: "h-2" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-4 w-4" }), _jsx("span", { children: "Database Connection" })] }), testResults.database ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-gray-400" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx("span", { children: "Authentication" })] }), testResults.auth ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-gray-400" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-4 w-4" }), _jsx("span", { children: "Real-time Updates" })] }), testResults.realtime ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-gray-400" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsx("span", { children: "File Storage" })] }), testResults.storage ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-gray-400" }))] })] }), _jsx(Button, { onClick: runIntegrationTests, className: "w-full", disabled: progress > 0 && progress < 100, children: progress > 0 && progress < 100 ? "Testing..." : "Run Tests" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Test Logs" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm", children: [testLogs.map((log, index) => (_jsx("div", { className: "mb-1", children: log }, index))), testLogs.length === 0 && (_jsx("div", { className: "text-gray-500", children: "No logs yet. Run tests to see output." }))] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), "Sample Patient Data"] }) }), _jsx(CardContent, { children: patients.length > 0 ? (_jsx("div", { className: "space-y-4", children: patients.map((patient, index) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Name" }), _jsxs("p", { className: "font-medium", children: [patient.first_name_en, " ", patient.last_name_en] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Emirates ID" }), _jsx("p", { className: "font-medium", children: patient.emirates_id })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Insurance" }), _jsx("p", { className: "font-medium", children: patient.insurance_provider })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), _jsx(Badge, { variant: patient.status === "active"
                                                            ? "default"
                                                            : "secondary", children: patient.status })] })] }) }, patient.id || index))) })) : (_jsxs(Alert, { children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: ["No patient data available. This could mean:", _jsxs("ul", { className: "list-disc list-inside mt-2 space-y-1", children: [_jsx("li", { children: "Database is empty (expected for new setup)" }), _jsx("li", { children: "User doesn't have permission to view patients" }), _jsx("li", { children: "Database connection issue" })] })] })] })) })] })] }) }));
};
export default SupabaseIntegrationStoryboard;
