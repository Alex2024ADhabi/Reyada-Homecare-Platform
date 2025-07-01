import React from "react";
import {
  Tabs,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Lock,
  Upload,
  Settings,
  Clock,
} from "@radix-ui/react";

const MalaffiIntegrationStatus = ({
  record,
  accessLogs,
  consentRecords,
  syncPatientToMalaffi,
  updateConsent,
  loading,
}) => {
  return (
    <div>
      <div>
        <Tabs>
          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Overview</span>
                </CardTitle>
                <CardDescription>
                  Summary of patient data integration status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(record.dataSharing).map(([key, enabled]) => (
                    <div key={key} className="flex items-center space-x-1">
                      {enabled ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="text-xs capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Logs Tab */}
          <TabsContent value="access-logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Data Access Audit Trail</span>
                </CardTitle>
                <CardDescription>
                  Track all access to patient data through Malaffi HIE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessLogs.map((log, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{log.accessedBy}</h4>
                          <p className="text-sm text-gray-600">
                            {log.dataType} - {log.purpose}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={log.approved ? "default" : "destructive"}
                          >
                            {log.approved ? "Approved" : "Denied"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sharing Tab */}
          <TabsContent value="data-sharing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Data Sharing Analytics</span>
                </CardTitle>
                <CardDescription>
                  Overview of data sharing patterns and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Data Types Shared</h4>
                    <div className="space-y-3">
                      {[
                        { type: "Demographics", percentage: 95 },
                        { type: "Medical History", percentage: 78 },
                        { type: "Medications", percentage: 89 },
                        { type: "Allergies", percentage: 92 },
                        { type: "Lab Results", percentage: 85 },
                        { type: "Imaging", percentage: 45 },
                        { type: "Clinical Notes", percentage: 67 },
                      ].map((item) => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.type}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">
                      Consent Status Distribution
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Active Consents</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {
                            consentRecords.filter(
                              (r) => r.consentStatus === "granted",
                            ).length
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Expired Consents</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">
                          {
                            consentRecords.filter(
                              (r) => r.consentStatus === "expired",
                            ).length
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Denied Consents</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">
                          {
                            consentRecords.filter(
                              (r) => r.consentStatus === "denied",
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Compliance & Security</span>
                </CardTitle>
                <CardDescription>
                  Data protection and regulatory compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Compliance Standards</h4>
                    <div className="space-y-3">
                      {[
                        {
                          standard: "DOH Standards",
                          status: "Compliant",
                          score: 98,
                        },
                        { standard: "GDPR", status: "Compliant", score: 95 },
                        { standard: "HIPAA", status: "Compliant", score: 97 },
                        { standard: "UAE DPA", status: "Compliant", score: 99 },
                      ].map((item) => (
                        <div
                          key={item.standard}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.standard}</p>
                            <p className="text-sm text-gray-600">
                              {item.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {item.score}%
                            </p>
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Security Measures</h4>
                    <div className="space-y-3">
                      {[
                        "AES-256 Encryption",
                        "OAuth 2.0 Authentication",
                        "Audit Trail Logging",
                        "Data Retention Policies",
                        "Access Control Lists",
                        "Regular Security Audits",
                      ].map((measure) => (
                        <div
                          key={measure}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{measure}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MalaffiIntegrationStatus;
