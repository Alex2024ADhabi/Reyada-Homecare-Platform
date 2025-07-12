import React, { useState, useEffect } from "react";

interface ComplianceMetric {
  name: string;
  value: number;
  target: number;
  status: "success" | "warning" | "danger";
  trend: "up" | "down" | "stable";
}

interface ComplianceIssue {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedRecords: number;
  detectedAt: string;
  status: "open" | "in-progress" | "resolved";
}

const DOHRealTimeComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([
    {
      name: "Documentation Completeness",
      value: 98,
      target: 95,
      status: "success",
      trend: "up",
    },
    {
      name: "Assessment Domain Coverage",
      value: 100,
      target: 100,
      status: "success",
      trend: "stable",
    },
    {
      name: "Clinical Signature Compliance",
      value: 97,
      target: 95,
      status: "success",
      trend: "up",
    },
    {
      name: "Patient ID Verification",
      value: 100,
      target: 100,
      status: "success",
      trend: "stable",
    },
    {
      name: "Audit Trail Completeness",
      value: 99,
      target: 95,
      status: "success",
      trend: "up",
    },
    {
      name: "Reporting Timeliness",
      value: 94,
      target: 90,
      status: "success",
      trend: "up",
    },
  ]);

  const [issues, setIssues] = useState<ComplianceIssue[]>([
    {
      id: "issue-001",
      severity: "medium",
      description: "Missing clinician signature on 3 assessment records",
      affectedRecords: 3,
      detectedAt: "2023-05-15T10:23:45Z",
      status: "in-progress",
    },
    {
      id: "issue-002",
      severity: "low",
      description: "Delayed reporting of 2 clinical assessments",
      affectedRecords: 2,
      detectedAt: "2023-05-14T16:42:12Z",
      status: "resolved",
    },
    {
      id: "issue-003",
      severity: "low",
      description: "Incomplete medication administration records",
      affectedRecords: 5,
      detectedAt: "2023-05-13T09:15:30Z",
      status: "resolved",
    },
  ]);

  const [overallCompliance, setOverallCompliance] = useState(98);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    const interval = setInterval(() => {
      // Simulate data updates
      setLastUpdated(new Date().toISOString());

      // Randomly update one metric
      setMetrics((prevMetrics) => {
        const newMetrics = [...prevMetrics];
        const randomIndex = Math.floor(Math.random() * newMetrics.length);
        const randomChange = Math.random() > 0.5 ? 1 : -1;

        newMetrics[randomIndex] = {
          ...newMetrics[randomIndex],
          value: Math.min(
            100,
            Math.max(80, newMetrics[randomIndex].value + randomChange),
          ),
          trend: randomChange > 0 ? "up" : "down",
        };

        // Update status based on value and target
        newMetrics[randomIndex].status =
          newMetrics[randomIndex].value >= newMetrics[randomIndex].target
            ? "success"
            : newMetrics[randomIndex].value >=
                newMetrics[randomIndex].target * 0.9
              ? "warning"
              : "danger";

        return newMetrics;
      });

      // Calculate overall compliance
      setOverallCompliance((prev) => {
        const randomChange = (Math.random() > 0.7 ? 1 : -1) * 0.5;
        return Math.min(100, Math.max(90, prev + randomChange));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          DOH Compliance Dashboard
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(lastUpdated)}
        </div>
      </div>

      {/* Overall Compliance Gauge */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">
            Overall Compliance
          </h3>
          <span className="text-2xl font-bold text-blue-600">
            {overallCompliance.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${overallCompliance >= 95 ? "bg-green-500" : overallCompliance >= 90 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${overallCompliance}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>Target: 95%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Compliance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">{metric.name}</h4>
                <div className="flex items-center">
                  <span
                    className={`font-bold ${metric.status === "success" ? "text-green-600" : metric.status === "warning" ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {metric.value}%
                  </span>
                  <span className="ml-1">{getTrendIcon(metric.trend)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${metric.status === "success" ? "bg-green-500" : metric.status === "warning" ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: {metric.target}%</span>
                <span>
                  {metric.value >= metric.target
                    ? `+${(metric.value - metric.target).toFixed(1)}%`
                    : `-${(metric.target - metric.value).toFixed(1)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Issues */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Compliance Issues
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Affected Records
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Detected At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)} text-white`}
                    >
                      {issue.severity.charAt(0).toUpperCase() +
                        issue.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {issue.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.affectedRecords}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(issue.detectedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}
                    >
                      {issue.status.charAt(0).toUpperCase() +
                        issue.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No compliance issues detected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DOHRealTimeComplianceDashboard;
