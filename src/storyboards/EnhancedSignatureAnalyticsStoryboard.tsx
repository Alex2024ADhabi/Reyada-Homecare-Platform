import React from "react";
import SignatureAnalyticsDashboard from "@/components/ui/signature-analytics-dashboard";
import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";

// Mock data for demonstration
const mockSignatures: SignatureData[] = [
  {
    strokes: [],
    boundingBox: { minX: 0, maxX: 100, minY: 0, maxY: 50 },
    metadata: {
      totalTime: 5000,
      strokeCount: 15,
      averagePressure: 0.7,
      signatureComplexity: 45,
      deviceType: "mobile",
      touchSupported: true,
      captureMethod: "touch",
      deviceInfo: {
        userAgent: "Mobile Safari",
        platform: "iPhone",
        screenResolution: "375x812",
        pixelRatio: 3,
      },
      performanceMetrics: {
        renderTime: 2.5,
        strokeLatency: 1.2,
        memoryUsage: 45,
        frameRate: 60,
      },
      pressureSensitive: true,
      maxTouchPoints: 5,
      hardwareConcurrency: 6,
      deviceMemory: 4,
      connectionType: "4g",
      offlineCapable: true,
      capturedOffline: false,
    },
    imageData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  },
  {
    strokes: [],
    boundingBox: { minX: 0, maxX: 120, minY: 0, maxY: 60 },
    metadata: {
      totalTime: 3500,
      strokeCount: 12,
      averagePressure: 0.5,
      signatureComplexity: 38,
      deviceType: "desktop",
      touchSupported: false,
      captureMethod: "mouse",
      deviceInfo: {
        userAgent: "Chrome Desktop",
        platform: "Win32",
        screenResolution: "1920x1080",
        pixelRatio: 1,
      },
      performanceMetrics: {
        renderTime: 1.8,
        strokeLatency: 0.8,
        memoryUsage: 32,
        frameRate: 120,
      },
      pressureSensitive: false,
      maxTouchPoints: 0,
      hardwareConcurrency: 8,
      deviceMemory: 8,
      connectionType: "ethernet",
      offlineCapable: true,
      capturedOffline: false,
    },
    imageData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  },
];

const mockWorkflows: WorkflowInstance[] = [
  {
    id: "workflow_001",
    workflowId: "emergency_preparedness",
    documentId: "doc_001",
    patientId: "patient_001",
    episodeId: "episode_001",
    status: "completed",
    currentStep: "",
    completedSteps: ["clinician_review", "patient_acknowledgment"],
    pendingSteps: [],
    signatures: [
      {
        stepId: "clinician_review",
        signatureId: "sig_001",
        signerUserId: "user_001",
        signerName: "Dr. Sarah Johnson",
        signerRole: "physician",
        signatureData: mockSignatures[0],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.100",
        deviceInfo: mockSignatures[0].metadata.deviceInfo,
      },
      {
        stepId: "patient_acknowledgment",
        signatureId: "sig_002",
        signerUserId: "user_002",
        signerName: "John Smith",
        signerRole: "patient",
        signatureData: mockSignatures[1],
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.101",
        deviceInfo: mockSignatures[1].metadata.deviceInfo,
      },
    ],
    metadata: {
      formType: "emergency_preparedness",
      formData: {
        patientCapable: true,
        riskLevel: "medium",
      },
      priority: "high",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tags: ["emergency", "high-priority"],
    },
    auditTrail: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "workflow_002",
    workflowId: "documentation_review",
    documentId: "doc_002",
    patientId: "patient_002",
    status: "in_progress",
    currentStep: "quality_assurance",
    completedSteps: ["primary_reviewer"],
    pendingSteps: ["quality_assurance"],
    signatures: [
      {
        stepId: "primary_reviewer",
        signatureId: "sig_003",
        signerUserId: "user_003",
        signerName: "Nurse Mary Wilson",
        signerRole: "reviewer",
        signatureData: mockSignatures[0],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        ipAddress: "192.168.1.102",
        deviceInfo: mockSignatures[0].metadata.deviceInfo,
      },
    ],
    metadata: {
      formType: "documentation_review",
      formData: {
        overallQualityRating: "good",
        regulatoryReporting: "no",
      },
      priority: "medium",
      tags: ["review", "quality"],
    },
    auditTrail: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export default function EnhancedSignatureAnalyticsStoryboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Signature Analytics Dashboard - P3-002.1.3
          </h1>
          <p className="text-gray-600">
            Advanced analytics with real-time monitoring, performance tracking,
            bottleneck analysis, user performance metrics, mobile optimization,
            enhanced export capabilities, and comprehensive reporting features.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Real-time Metrics
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Performance Tracking
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Bottleneck Analysis
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              User Analytics
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              Mobile Optimized
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Advanced Export
            </span>
          </div>
        </div>

        <SignatureAnalyticsDashboard
          signatures={mockSignatures}
          workflows={mockWorkflows}
          enablePerformanceTracking={true}
          enableBottleneckAnalysis={true}
          enableUserAnalytics={true}
          enableMobileOptimization={true}
          refreshInterval={15000} // Faster refresh for demo
          defaultDateRange={{
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          }}
        />
      </div>
    </div>
  );
}
