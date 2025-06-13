import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  User,
  CheckCircle,
  AlertCircle,
  Key,
  Users,
  Settings,
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import LoginForm from "@/components/auth/LoginForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const AuthenticationFlowStoryboard = () => {
  const { user, userProfile, loading, signOut, isRole, hasPermission } =
    useSupabaseAuth();
  const [activeDemo, setActiveDemo] = useState("login");

  const DemoSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const UserInfoCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Current User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <Badge variant="outline">
                {userProfile?.role || "Loading..."}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">
                {userProfile?.full_name || "Loading..."}
              </p>
            </div>
          </div>

          {userProfile?.license_number && (
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="font-medium">{userProfile.license_number}</p>
            </div>
          )}

          {userProfile?.department && (
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{userProfile.department}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">Account Status:</p>
            <Badge variant={userProfile?.is_active ? "default" : "destructive"}>
              {userProfile?.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RolePermissionDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Role & Permission Testing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["doctor", "nurse", "admin", "therapist"].map((role) => (
              <div
                key={role}
                className="flex items-center justify-between p-3 border rounded"
              >
                <span className="capitalize">{role}</span>
                {isRole(role) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Permission Checks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "read_patients",
                "write_patients",
                "read_clinical_forms",
                "write_clinical_forms",
                "admin_access",
                "delete_records",
              ].map((permission) => (
                <div
                  key={permission}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="font-mono">{permission}</span>
                  {hasPermission(permission) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProtectedRouteDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Protected Route Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Admin Only Section</h4>
            <ProtectedRoute requiredRole="admin" fallbackPath="/login">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ You have admin access!</p>
              </div>
            </ProtectedRoute>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Doctor Only Section</h4>
            <ProtectedRoute requiredRole="doctor" fallbackPath="/login">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ You have doctor access!</p>
              </div>
            </ProtectedRoute>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Permission-Based Section</h4>
            <ProtectedRoute
              requiredPermission="admin_access"
              fallbackPath="/login"
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ You have admin permissions!</p>
              </div>
            </ProtectedRoute>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Authentication Flow Demo
              </h1>
              <p className="text-gray-600">
                Comprehensive testing of Supabase authentication and
                authorization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
              {user && (
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>

        {!user ? (
          <DemoSection title="Login Required">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Please sign in to test the authentication features
              </p>
            </div>
            <LoginForm onSuccess={() => window.location.reload()} />
          </DemoSection>
        ) : (
          <Tabs value={activeDemo} onValueChange={setActiveDemo}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user">User Info</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="protected">Protected Routes</TabsTrigger>
              <TabsTrigger value="security">Security Features</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="mt-6">
              <UserInfoCard />
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              <RolePermissionDemo />
            </TabsContent>

            <TabsContent value="protected" className="mt-6">
              <ProtectedRouteDemo />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Session Management</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Automatic token refresh and session persistence
                        </p>
                        <Badge variant="outline">Active</Badge>
                      </div>

                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Role-Based Access</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Granular permissions based on user roles
                        </p>
                        <Badge variant="outline">Configured</Badge>
                      </div>

                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Audit Logging</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          All actions are logged for compliance
                        </p>
                        <Badge variant="outline">Enabled</Badge>
                      </div>

                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Data Encryption</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          AES-256 encryption for sensitive data
                        </p>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AuthenticationFlowStoryboard;
