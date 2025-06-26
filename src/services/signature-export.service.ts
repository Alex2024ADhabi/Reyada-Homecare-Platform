/**
 * Signature Export Service
 * Enhanced export capabilities for signature data with multiple formats
 * and comprehensive data formatting options.
 */

import { SignatureData } from "@/components/ui/signature-capture";
import { WorkflowInstance } from "@/services/signature-workflow.service";
import { SignatureAuditEntry } from "@/services/signature-audit.service";

export interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json" | "xml";
  includeMetadata: boolean;
  includePerformanceMetrics: boolean;
  includeDeviceInfo: boolean;
  includeImages: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    userIds?: string[];
    documentTypes?: string[];
    complianceStatus?: string[];
  };
  groupBy?: "user" | "document" | "date" | "workflow";
  sortBy?: "timestamp" | "user" | "compliance" | "performance";
  sortOrder?: "asc" | "desc";
}

export interface ExportResult {
  data: string | Buffer | Blob;
  filename: string;
  mimeType: string;
  size: number;
  recordCount: number;
}

export interface PerformanceExportData {
  signatureId: string;
  timestamp: string;
  userId: string;
  userName: string;
  documentId: string;
  completionTime: number;
  strokeCount: number;
  averagePressure: number;
  deviceType: string;
  captureMethod: string;
  frameRate: number;
  latency: number;
  memoryUsage: number;
  pressureSensitive: boolean;
  offlineCapable: boolean;
  complianceScore: number;
  validationIssues: string[];
}

export interface BottleneckAnalysis {
  stepId: string;
  stepName: string;
  averageTime: number;
  medianTime: number;
  maxTime: number;
  timeoutRate: number;
  userPerformance: {
    userId: string;
    userName: string;
    averageTime: number;
    completionRate: number;
  }[];
}

class SignatureExportService {
  private exportHistory: Map<string, ExportResult> = new Map();

  /**
   * Export signature performance data
   */
  async exportPerformanceData(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    const performanceData = this.aggregatePerformanceData(
      signatures,
      workflows,
      auditEntries,
    );

    const filteredData = this.applyFilters(performanceData, options);
    const sortedData = this.applySorting(filteredData, options);
    const groupedData = this.applyGrouping(sortedData, options);

    return this.generateExport(groupedData, options, "performance");
  }

  /**
   * Export completion rate tracking data
   */
  async exportCompletionRates(
    workflows: WorkflowInstance[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    const completionData = workflows.map((workflow) => {
      const totalSteps = workflow.signatures.length;
      const completedSteps = workflow.signatures.filter(
        (s) => s.timestamp,
      ).length;
      const completionRate =
        totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      const startTime = new Date(workflow.createdAt).getTime();
      const endTime = workflow.completedAt
        ? new Date(workflow.completedAt).getTime()
        : Date.now();
      const duration = endTime - startTime;

      return {
        workflowId: workflow.id,
        documentId: workflow.documentId,
        documentType: workflow.metadata.formType,
        status: workflow.status,
        totalSteps,
        completedSteps,
        completionRate,
        duration,
        createdAt: workflow.createdAt,
        completedAt: workflow.completedAt,
        assignedUsers: workflow.signatures.map((s) => s.signerName).join(", "),
        priority: workflow.metadata.priority,
      };
    });

    return this.generateExport(completionData, options, "completion_rates");
  }

  /**
   * Export bottleneck analysis
   */
  async exportBottleneckAnalysis(
    workflows: WorkflowInstance[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    const bottlenecks = this.analyzeBottlenecks(workflows);
    return this.generateExport(bottlenecks, options, "bottlenecks");
  }

  /**
   * Export user performance analytics
   */
  async exportUserPerformance(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    const userPerformance = this.calculateUserPerformance(
      signatures,
      workflows,
      auditEntries,
    );

    return this.generateExport(userPerformance, options, "user_performance");
  }

  /**
   * Export comprehensive analytics dashboard data
   */
  async exportDashboardData(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    const dashboardData = {
      summary: this.generateSummaryMetrics(signatures, workflows, auditEntries),
      performance: this.aggregatePerformanceData(
        signatures,
        workflows,
        auditEntries,
      ),
      completionRates: this.calculateCompletionRates(workflows),
      bottlenecks: this.analyzeBottlenecks(workflows),
      userPerformance: this.calculateUserPerformance(
        signatures,
        workflows,
        auditEntries,
      ),
      deviceMetrics: this.analyzeDeviceMetrics(signatures),
      complianceMetrics: this.calculateComplianceMetrics(auditEntries),
      trends: this.generateTrendAnalysis(signatures, workflows, auditEntries),
    };

    return this.generateExport(dashboardData, options, "dashboard");
  }

  // Private helper methods

  private aggregatePerformanceData(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
  ): PerformanceExportData[] {
    return signatures.map((signature) => {
      const workflow = workflows.find((w) =>
        w.signatures.some(
          (s) => s.signatureId === signature.metadata.deviceInfo.toString(),
        ),
      );

      const auditEntry = auditEntries.find(
        (a) => a.signatureId === signature.metadata.deviceInfo.toString(),
      );

      return {
        signatureId: signature.metadata.deviceInfo.toString(),
        timestamp: new Date().toISOString(),
        userId: workflow?.signatures[0]?.signerUserId || "unknown",
        userName: workflow?.signatures[0]?.signerName || "unknown",
        documentId: workflow?.documentId || "unknown",
        completionTime: signature.metadata.totalTime,
        strokeCount: signature.metadata.strokeCount,
        averagePressure: signature.metadata.averagePressure,
        deviceType: signature.metadata.deviceType,
        captureMethod: signature.metadata.captureMethod,
        frameRate: signature.metadata.performanceMetrics?.frameRate || 0,
        latency: signature.metadata.performanceMetrics?.strokeLatency || 0,
        memoryUsage: signature.metadata.performanceMetrics?.memoryUsage || 0,
        pressureSensitive: signature.metadata.pressureSensitive || false,
        offlineCapable: signature.metadata.offlineCapable || false,
        complianceScore: 100, // This would come from validation
        validationIssues: [],
      };
    });
  }

  private analyzeBottlenecks(
    workflows: WorkflowInstance[],
  ): BottleneckAnalysis[] {
    const stepAnalysis = new Map<
      string,
      {
        times: number[];
        timeouts: number;
        userTimes: Map<string, number[]>;
      }
    >();

    workflows.forEach((workflow) => {
      workflow.signatures.forEach((signature, index) => {
        const stepId = `step_${index}`;
        const stepName = signature.signerRole;

        if (!stepAnalysis.has(stepId)) {
          stepAnalysis.set(stepId, {
            times: [],
            timeouts: 0,
            userTimes: new Map(),
          });
        }

        const analysis = stepAnalysis.get(stepId)!;
        const stepTime =
          new Date(signature.timestamp).getTime() -
          new Date(workflow.createdAt).getTime();

        analysis.times.push(stepTime);

        if (!analysis.userTimes.has(signature.signerUserId)) {
          analysis.userTimes.set(signature.signerUserId, []);
        }
        analysis.userTimes.get(signature.signerUserId)!.push(stepTime);
      });
    });

    return Array.from(stepAnalysis.entries()).map(([stepId, analysis]) => {
      const times = analysis.times.sort((a, b) => a - b);
      const averageTime =
        times.reduce((sum, time) => sum + time, 0) / times.length;
      const medianTime = times[Math.floor(times.length / 2)];
      const maxTime = Math.max(...times);
      const timeoutRate = (analysis.timeouts / times.length) * 100;

      const userPerformance = Array.from(analysis.userTimes.entries()).map(
        ([userId, userTimes]) => {
          const avgTime =
            userTimes.reduce((sum, time) => sum + time, 0) / userTimes.length;
          return {
            userId,
            userName: `User ${userId}`, // This would come from user data
            averageTime: avgTime,
            completionRate: 100, // This would be calculated from actual data
          };
        },
      );

      return {
        stepId,
        stepName: `Step ${stepId}`,
        averageTime,
        medianTime,
        maxTime,
        timeoutRate,
        userPerformance,
      };
    });
  }

  private calculateUserPerformance(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
  ) {
    const userMap = new Map<
      string,
      {
        signaturesCompleted: number;
        totalTime: number;
        averageTime: number;
        complianceRate: number;
        errorRate: number;
        deviceTypes: Set<string>;
        captureMethod: Set<string>;
      }
    >();

    workflows.forEach((workflow) => {
      workflow.signatures.forEach((signature) => {
        if (!userMap.has(signature.signerUserId)) {
          userMap.set(signature.signerUserId, {
            signaturesCompleted: 0,
            totalTime: 0,
            averageTime: 0,
            complianceRate: 0,
            errorRate: 0,
            deviceTypes: new Set(),
            captureMethod: new Set(),
          });
        }

        const user = userMap.get(signature.signerUserId)!;
        user.signaturesCompleted++;

        // Find corresponding signature data
        const sigData = signatures.find(
          (s) => s.metadata.deviceInfo.toString() === signature.signatureId,
        );

        if (sigData) {
          user.totalTime += sigData.metadata.totalTime;
          user.deviceTypes.add(sigData.metadata.deviceType);
          user.captureMethod.add(sigData.metadata.captureMethod);
        }
      });
    });

    return Array.from(userMap.entries()).map(([userId, data]) => ({
      userId,
      userName:
        workflows
          .find((w) => w.signatures.some((s) => s.signerUserId === userId))
          ?.signatures.find((s) => s.signerUserId === userId)?.signerName ||
        "Unknown",
      signaturesCompleted: data.signaturesCompleted,
      averageTime:
        data.signaturesCompleted > 0
          ? data.totalTime / data.signaturesCompleted
          : 0,
      complianceRate: 95, // This would be calculated from actual compliance data
      errorRate: 5, // This would be calculated from actual error data
      deviceTypes: Array.from(data.deviceTypes),
      captureMethods: Array.from(data.captureMethod),
    }));
  }

  private calculateCompletionRates(workflows: WorkflowInstance[]) {
    return workflows.map((workflow) => {
      const totalSteps = workflow.signatures.length;
      const completedSteps = workflow.signatures.filter(
        (s) => s.timestamp,
      ).length;
      return {
        workflowId: workflow.id,
        completionRate:
          totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
        totalSteps,
        completedSteps,
        status: workflow.status,
      };
    });
  }

  private analyzeDeviceMetrics(signatures: SignatureData[]) {
    const deviceMap = new Map<
      string,
      {
        count: number;
        averageTime: number;
        averagePressure: number;
        frameRates: number[];
        latencies: number[];
      }
    >();

    signatures.forEach((signature) => {
      const deviceType = signature.metadata.deviceType;
      if (!deviceMap.has(deviceType)) {
        deviceMap.set(deviceType, {
          count: 0,
          averageTime: 0,
          averagePressure: 0,
          frameRates: [],
          latencies: [],
        });
      }

      const device = deviceMap.get(deviceType)!;
      device.count++;
      device.averageTime += signature.metadata.totalTime;
      device.averagePressure += signature.metadata.averagePressure;

      if (signature.metadata.performanceMetrics) {
        device.frameRates.push(signature.metadata.performanceMetrics.frameRate);
        device.latencies.push(
          signature.metadata.performanceMetrics.strokeLatency,
        );
      }
    });

    return Array.from(deviceMap.entries()).map(([deviceType, data]) => ({
      deviceType,
      count: data.count,
      averageTime: data.averageTime / data.count,
      averagePressure: data.averagePressure / data.count,
      averageFrameRate:
        data.frameRates.length > 0
          ? data.frameRates.reduce((sum, rate) => sum + rate, 0) /
            data.frameRates.length
          : 0,
      averageLatency:
        data.latencies.length > 0
          ? data.latencies.reduce((sum, lat) => sum + lat, 0) /
            data.latencies.length
          : 0,
    }));
  }

  private calculateComplianceMetrics(auditEntries: SignatureAuditEntry[]) {
    const total = auditEntries.length;
    const compliant = auditEntries.filter(
      (e) => e.complianceStatus === "compliant",
    ).length;
    const nonCompliant = auditEntries.filter(
      (e) => e.complianceStatus === "non_compliant",
    ).length;
    const pending = auditEntries.filter(
      (e) => e.complianceStatus === "pending",
    ).length;
    const warnings = auditEntries.filter(
      (e) => e.complianceStatus === "warning",
    ).length;

    return {
      total,
      compliant,
      nonCompliant,
      pending,
      warnings,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
    };
  }

  private generateSummaryMetrics(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
  ) {
    return {
      totalSignatures: signatures.length,
      totalWorkflows: workflows.length,
      completedWorkflows: workflows.filter((w) => w.status === "completed")
        .length,
      averageCompletionTime:
        workflows.reduce((sum, w) => {
          if (w.completedAt) {
            return (
              sum +
              (new Date(w.completedAt).getTime() -
                new Date(w.createdAt).getTime())
            );
          }
          return sum;
        }, 0) / workflows.filter((w) => w.completedAt).length,
      complianceRate:
        this.calculateComplianceMetrics(auditEntries).complianceRate,
    };
  }

  private generateTrendAnalysis(
    signatures: SignatureData[],
    workflows: WorkflowInstance[],
    auditEntries: SignatureAuditEntry[],
  ) {
    // Generate daily trends for the last 30 days
    const trends = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      const daySignatures = signatures.filter((s) =>
        new Date(s.metadata.deviceInfo.toString())
          .toISOString()
          .startsWith(dateStr),
      ).length;

      const dayWorkflows = workflows.filter((w) =>
        w.createdAt.startsWith(dateStr),
      ).length;

      const dayCompliance = auditEntries.filter(
        (e) =>
          e.timestamp.startsWith(dateStr) && e.complianceStatus === "compliant",
      ).length;

      trends.push({
        date: dateStr,
        signatures: daySignatures,
        workflows: dayWorkflows,
        compliance: dayCompliance,
      });
    }

    return trends;
  }

  private applyFilters(data: any[], options: ExportOptions): any[] {
    let filtered = data;

    if (options.dateRange) {
      const startDate = new Date(options.dateRange.startDate);
      const endDate = new Date(options.dateRange.endDate);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.timestamp || item.createdAt);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (options.filters?.userIds) {
      filtered = filtered.filter((item) =>
        options.filters!.userIds!.includes(item.userId),
      );
    }

    return filtered;
  }

  private applySorting(data: any[], options: ExportOptions): any[] {
    if (!options.sortBy) return data;

    return data.sort((a, b) => {
      const aValue = a[options.sortBy!];
      const bValue = b[options.sortBy!];

      if (options.sortOrder === "desc") {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }

  private applyGrouping(data: any[], options: ExportOptions): any[] {
    if (!options.groupBy) return data;

    const grouped = new Map<string, any[]>();

    data.forEach((item) => {
      const key = item[options.groupBy!] || "unknown";
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    return Array.from(grouped.entries()).map(([key, items]) => ({
      group: key,
      items,
      count: items.length,
    }));
  }

  private async generateExport(
    data: any,
    options: ExportOptions,
    type: string,
  ): Promise<ExportResult> {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `signature_${type}_${timestamp}.${options.format}`;

    let exportData: string | Buffer | Blob;
    let mimeType: string;

    switch (options.format) {
      case "json":
        exportData = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        break;

      case "csv":
        exportData = this.convertToCSV(data);
        mimeType = "text/csv";
        break;

      case "excel":
        exportData = await this.convertToExcel(data);
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;

      case "pdf":
        exportData = await this.convertToPDF(data, type);
        mimeType = "application/pdf";
        break;

      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    const result: ExportResult = {
      data: exportData,
      filename,
      mimeType,
      size:
        typeof exportData === "string"
          ? exportData.length
          : exportData.byteLength || 0,
      recordCount: Array.isArray(data) ? data.length : 1,
    };

    // Store in export history
    this.exportHistory.set(`${type}_${timestamp}`, result);

    return result;
  }

  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return "";
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  private async convertToExcel(data: any[]): Promise<Buffer> {
    // This would use a library like ExcelJS
    // For now, return CSV as buffer
    const csvData = this.convertToCSV(data);
    return Buffer.from(csvData, "utf-8");
  }

  private async convertToPDF(data: any, type: string): Promise<Buffer> {
    // This would use a library like jsPDF or PDFKit
    // For now, return a simple text representation
    const content = `Signature ${type.toUpperCase()} Report\n\nGenerated: ${new Date().toISOString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
    return Buffer.from(content, "utf-8");
  }

  /**
   * Get export history
   */
  getExportHistory(): ExportResult[] {
    return Array.from(this.exportHistory.values());
  }

  /**
   * Clear export history
   */
  clearExportHistory(): void {
    this.exportHistory.clear();
  }
}

export const signatureExportService = new SignatureExportService();
export default signatureExportService;
