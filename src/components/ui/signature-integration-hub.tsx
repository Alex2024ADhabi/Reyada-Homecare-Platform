/**
 * Signature Integration Hub
 * P3-002.5.3: Comprehensive Integration Management
 *
 * Central hub for managing all signature system integrations including
 * DOH compliance, Daman insurance, Malaffi EMR, and external APIs.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Link,
  Network,
  RefreshCw,
  Settings,
  Shield,
  Wifi,
  XCircle,
  Zap,
  Activity,
  FileText,
  Users,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface IntegrationEndpoint {
  id: string;
  name: string;
  type: "doh" | "daman" | "malaffi" | "api" | "webhook" | "database";
  url: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync: string;
  nextSync?: string;
  health: number; // 0-100
  responseTime: number;
  errorCount: number;
  successRate: number;
  authentication: {
    type: "none" | "basic" | "bearer" | "oauth" | "certificate";
    status: "valid" | "expired" | "invalid";
    expiresAt?: string;
  };
  configuration: Record<string, any>;
  metadata: {
    version: string;
    lastUpdated: string;
    maintainer: string;
    documentation?: string;
  };
}

export interface IntegrationLog {
  id: string;
  endpointId: string;
  timestamp: string;
  type: "sync" | "error" | "warning" | "info";
  message: string;
  details?: any;
  duration?: number;
  status: "success" | "failure" | "partial";
}

export interface SyncOperation {
  id: string;
  endpointId: string;
  type: "full" | "incremental" | "manual";
  status: "running" | "completed" | "failed" | "cancelled";
  startTime: string;
  endTime?: string;
  progress: number;
  recordsProcessed: number;
  recordsTotal: number;
  errors: string[];
}

export interface SignatureIntegrationHubProps {
  endpoints: IntegrationEndpoint[];
  logs: IntegrationLog[];
  syncOperations: SyncOperation[];
  onTestConnection?: (endpointId: string) => Promise<boolean>;
  onSyncEndpoint?: (endpointId: string, type: "full" | "incremental") => Promise<void>;
  onUpdateEndpoint?: (endpoint: IntegrationEndpoint) => Promise<void>;
  onDeleteEndpoint?: (endpointId: string) => Promise<void>;
  onCreateEndpoint?: (endpoint: Partial<IntegrationEndpoint>) => Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

const SignatureIntegrationHub: React.FC<SignatureIntegrationHubProps> = ({
  endpoints,
  logs,
  syncOperations,
  onTestConnection,
  onSyncEndpoint,
  onUpdateEndpoint,
  onDeleteEndpoint,
  onCreateEndpoint,
  onRefresh,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState("endpoints");
  const [selectedEndpoint, setSelectedEndpoint] = useState<IntegrationEndpoint | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(endpoint => {
      const matchesType = filterType === "all" || endpoint.type === filterType;
      const matchesStatus = filterStatus === "all" || endpoint.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [endpoints, filterType, filterStatus]);

  // Calculate overall health
  const overallHealth = useMemo(() => {
    if (endpoints.length === 0) return 0;
    return endpoints.reduce((sum, endpoint) => sum + endpoint.health, 0) / endpoints.length;
  }, [endpoints]);

  // Get status counts
  const statusCounts = useMemo(() => {
    return endpoints.reduce((counts, endpoint) => {
      counts[endpoint.status] = (counts[endpoint.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }, [endpoints]);

  const handleTestConnection = async (endpointId: string) => {
    setIsTestingConnection(endpointId);
    try {
      await onTestConnection?.(endpointId);
    } finally {
      setIsTestingConnection(null);
    }
  };

  const handleSync = async (endpointId: string, type: "full" | "incremental") => {
    await onSyncEndpoint?.(endpointId, type);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "doh":
        return <Shield className="h-5 w-5 text-blue-600" />;
      case "daman":
        return <Network className="h-5 w-5 text-purple-600" />;
      case "malaffi":
        return <Database className="h-5 w-5 text-green-600" />;
      case "api":
        return <Globe className="h-5 w-5 text-orange-600" />;
      case "webhook":
        return <Wifi className="h-5 w-5 text-indigo-600" />;
      case "database":
        return <Database className="h-5 w-5 text-gray-600" />;
      default:
        return <Link className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAuthIcon = (authStatus: string) => {
    switch (authStatus) {
      case "valid":
        return <Lock className="h-4 w-4 text-green-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "invalid":
        return <Unlock className="h-4 w-4 text-red-600" />;
      default:
        return <Unlock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-6 w-6" />
              Integration Hub
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Health: {overallHealth.toFixed(1)}%
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold">{endpoints.length}</p>
              </div>
              <Link className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.connected || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.error || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold">{overallHealth.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={overallHealth} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="sync">Sync Operations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="doh">DOH</SelectItem>
                    <SelectItem value="daman">Daman</SelectItem>
                    <SelectItem value="malaffi">Malaffi</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setSelectedEndpoint(null);
                    setIsConfigDialogOpen(true);
                  }}
                  className="ml-auto"
                >
                  Add Endpoint
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(endpoint.type)}
                      <div>
                        <h3 className="font-semibold">{endpoint.name}</h3>
                        <p className="text-sm text-gray-600">{endpoint.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(endpoint.status)}
                      <Badge className={cn("text-xs", getStatusColor(endpoint.status))}>
                        {endpoint.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Health:</span>
                      <span className="font-medium">{endpoint.health}%</span>
                    </div>
                    <Progress value={endpoint.health} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Response Time:</span>
                        <span className="ml-2 font-medium">{endpoint.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">{endpoint.successRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Authentication:</span>
                      <div className="flex items-center gap-1">
                        {getAuthIcon(endpoint.authentication.status)}
                        <span className="text-xs">
                          {endpoint.authentication.type} - {endpoint.authentication.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="ml-2">
                        {new Date(endpoint.lastSync).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(endpoint.id)}
                      disabled={isTestingConnection === endpoint.id}
                      className="flex items-center gap-2"
                    >
                      <Zap className={cn(
                        "h-4 w-4",
                        isTestingConnection === endpoint.id && "animate-pulse"
                      )} />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(endpoint.id, "incremental")}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sync
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        setIsConfigDialogOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Operations Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sync Operations</CardTitle>
            </CardHeader>
            <CardContent>
              {syncOperations.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active sync operations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syncOperations.map((operation) => {
                    const endpoint = endpoints.find(e => e.id === operation.endpointId);
                    return (
                      <div key={operation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {endpoint && getTypeIcon(endpoint.type)}
                            <span className="font-medium">
                              {endpoint?.name || operation.endpointId}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {operation.type}
                            </Badge>
                          </div>
                          <Badge className={cn(
                            "text-xs",
                            operation.status === "completed" ? "bg-green-100 text-green-800" :
                            operation.status === "failed" ? "bg-red-100 text-red-800" :
                            operation.status === "running" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {operation.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress:</span>
                            <span>{operation.recordsProcessed} / {operation.recordsTotal}</span>
                          </div>
                          <Progress value={operation.progress} className="h-2" />

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>Started: {new Date(operation.startTime).toLocaleString()}</div>
                            {operation.endTime && (
                              <div>Ended: {new Date(operation.endTime).toLocaleString()}</div>
                            )}
                          </div>

                          {operation.errors.length > 0 && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {operation.errors.length} error(s) occurred during sync
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No activity logs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 50).map((log) => {
                    const endpoint = endpoints.find(e => e.id === log.endpointId);
                    return (
                      <div key={log.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {endpoint && getTypeIcon(endpoint.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {endpoint?.name || log.endpointId}
                                </span>
                                <Badge className={cn(
                                  "text-xs",
                                  log.type === "error" ? "bg-red-100 text-red-800" :
                                  log.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                                  log.type === "sync" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                )}>
                                  {log.type.toUpperCase()}
                                </Badge>
                                <Badge className={cn(
                                  "text-xs",
                                  log.status === "success" ? "bg-green-100 text-green-800" :
                                  log.status === "failure" ? "bg-red-100 text-red-800" :
                                  "bg-yellow-100 text-yellow-800"
                                )}>
                                  {log.status.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">{log.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(log.timestamp).toLocaleString()}
                                {log.duration && ` • ${log.duration}ms`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Sync Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto Sync Interval</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Notification Settings</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alert Threshold</label>
                    <Select defaultValue="error">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">All Events</SelectItem>
                        <SelectItem value="warning">Warnings & Errors</SelectItem>
                        <SelectItem value="error">Errors Only</SelectItem>
                        <SelectItem value="none">No Alerts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEndpoint ? "Edit Endpoint" : "Add New Endpoint"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="Endpoint name"
                  defaultValue={selectedEndpoint?.name}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select defaultValue={selectedEndpoint?.type || "api"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doh">DOH Compliance</SelectItem>
                    <SelectItem value="daman">Daman Insurance</SelectItem>
                    <SelectItem value="malaffi">Malaffi EMR</SelectItem>
                    <SelectItem value="api">REST API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input 
                placeholder="https://api.example.com"
                defaultValue={selectedEndpoint?.url}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Authentication Type</label>
                <Select defaultValue={selectedEndpoint?.authentication.type || "none"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Configuration (JSON)</label>
              <Textarea 
                placeholder='{"key": "value"}'
                defaultValue={JSON.stringify(selectedEndpoint?.configuration || {}, null, 2)}
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsConfigDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsConfigDialogOpen(false)}>