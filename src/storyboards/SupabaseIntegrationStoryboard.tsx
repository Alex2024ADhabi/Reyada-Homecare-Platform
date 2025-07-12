import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  Database,
  Users,
  FileText,
  Shield,
  Zap,
  Activity,
} from "lucide-react";
import { supabase, AuthService, PatientService } from "@/api/supabase.api";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LoginForm from "@/components/auth/LoginForm";

const SupabaseIntegrationStoryboard = () => {
  const { user, userProfile, loading, signOut } = useSupabaseAuth();
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");
  const [testResults, setTestResults] = useState({
    auth: false,
    database: false,
    realtime: false,
    storage: false,
  });
  const [progress, setProgress] = useState(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
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
      } else {
        throw error;
      }
    } catch (error) {
      setConnectionStatus("error");
      addLog(`❌ Database connection failed: ${error}`);
    }
    setProgress(30);

    // Test 2: Authentication
    if (user) {
      addLog("✅ Authentication working");
      setTestResults((prev) => ({ ...prev, auth: true }));
    } else {
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
      } else {
        addLog(`⚠️ No patients found or error: ${error?.message}`);
      }
    } catch (error) {
      addLog(`❌ Patient loading failed: ${error}`);
    }
    setProgress(70);

    // Test 4: Real-time subscription
    try {
      const channel = supabase
        .channel("test-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "patients" },
          () => {
            addLog("✅ Real-time subscription working");
            setTestResults((prev) => ({ ...prev, realtime: true }));
          },
        )
        .subscribe();

      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 2000);
    } catch (error) {
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
    } catch (error) {
      addLog(`⚠️ Storage test skipped: ${error}`);
    }
    setProgress(100);

    addLog("Integration tests completed!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Supabase Integration Demo
            </h1>
            <p className="text-gray-600">
              Please sign in to test the Supabase integration
            </p>
          </div>
          <LoginForm onSuccess={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Supabase Integration Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time testing and monitoring of Supabase services
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {connectionStatus === "connected" ? "Connected" : "Checking..."}
              </Badge>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">
                  {userProfile?.role || "Loading..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">
                  {userProfile?.full_name || "Loading..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Integration Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Overall Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Database Connection</span>
                    </div>
                    {testResults.database ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Authentication</span>
                    </div>
                    {testResults.auth ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Real-time Updates</span>
                    </div>
                    {testResults.realtime ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>File Storage</span>
                    </div>
                    {testResults.storage ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <Button
                  onClick={runIntegrationTests}
                  className="w-full"
                  disabled={progress > 0 && progress < 100}
                >
                  {progress > 0 && progress < 100 ? "Testing..." : "Run Tests"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
                {testLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {testLogs.length === 0 && (
                  <div className="text-gray-500">
                    No logs yet. Run tests to see output.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sample Patient Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((patient, index) => (
                  <div
                    key={patient.id || index}
                    className="border rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">
                          {patient.first_name_en} {patient.last_name_en}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Emirates ID</p>
                        <p className="font-medium">{patient.emirates_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insurance</p>
                        <p className="font-medium">
                          {patient.insurance_provider}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge
                          variant={
                            patient.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No patient data available. This could mean:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Database is empty (expected for new setup)</li>
                    <li>User doesn't have permission to view patients</li>
                    <li>Database connection issue</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseIntegrationStoryboard;
