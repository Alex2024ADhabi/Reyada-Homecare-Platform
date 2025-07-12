import { useState, useEffect, useCallback } from "react";
import { ApiService } from "../services/api.service";
import { offlineService } from "../services/offline.service";
import { useOfflineSync } from "./useOfflineSync";

interface RevenueAnalytics {
  totalClaims: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  deniedAmount: number;
  adjustmentAmount: number;
  collectionRate: number;
  averageDaysToPayment: number;
}

interface AgingBucket {
  range: string;
  amount: number;
  percentage: number;
  claimCount: number;
}

interface AccountsReceivableAging {
  total: number;
  buckets: AgingBucket[];
}

interface DenialAnalytics {
  totalDenials: number;
  denialRate: number;
  topDenialReasons: { reason: string; count: number; percentage: number }[];
  averageAppealTime: number;
  appealSuccessRate: number;
}

export function useRevenueManagement() {
  const { isOnline, isSyncing } = useOfflineSync();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [accountsReceivableAging, setAccountsReceivableAging] =
    useState<AccountsReceivableAging | null>(null);
  const [denialAnalytics, setDenialAnalytics] =
    useState<DenialAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenue analytics
  const fetchRevenueAnalytics = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch analytics in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getRevenueAnalytics(params);
        setRevenueAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch revenue analytics:", err);
        setError("Failed to fetch revenue analytics");
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Fetch accounts receivable aging
  const fetchAccountsReceivableAging = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch aging report in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getAccountsReceivableAging(params);
        setAccountsReceivableAging(data);
      } catch (err) {
        console.error("Failed to fetch accounts receivable aging:", err);
        setError("Failed to fetch accounts receivable aging");
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Fetch denial analytics
  const fetchDenialAnalytics = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch denial analytics in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getDenialAnalytics(params);
        setDenialAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch denial analytics:", err);
        setError("Failed to fetch denial analytics");
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Submit a claim
  const submitClaim = useCallback(
    async (claimData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - submit directly
          const result = await ApiService.submitClaim(claimData);
          return result;
        } else {
          // Offline mode - queue for later submission
          await offlineService.addToQueue({
            url: "/claims/submit",
            method: "post",
            data: claimData,
            headers: { "Content-Type": "application/json" },
            timestamp: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            message: "Claim queued for submission when online",
          };
        }
      } catch (err) {
        console.error("Failed to submit claim:", err);
        setError("Failed to submit claim");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Record payment
  const recordPayment = useCallback(
    async (paymentData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - record directly
          const result = await ApiService.recordPayment(paymentData);
          return result;
        } else {
          // Offline mode - save locally
          const id = await offlineService.savePaymentReconciliation({
            reconciliationId: `payment-${Date.now()}`,
            claimId: paymentData.claimId,
            paymentDate: paymentData.paymentDate || new Date().toISOString(),
            paymentAmount: paymentData.amount,
            paymentMethod: paymentData.method,
            paymentReference: paymentData.reference,
            expectedAmount: paymentData.expectedAmount,
            variance: paymentData.amount - paymentData.expectedAmount,
            varianceReason: paymentData.varianceReason,
            status: "pending",
            lastModified: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            id,
            message: "Payment recorded locally",
          };
        }
      } catch (err) {
        console.error("Failed to record payment:", err);
        setError("Failed to record payment");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Record denial
  const recordDenial = useCallback(
    async (denialData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - record directly
          const result = await ApiService.recordDenial(denialData);
          return result;
        } else {
          // Offline mode - save locally
          const id = await offlineService.saveDenialManagement({
            denialId: `denial-${Date.now()}`,
            claimId: denialData.claimId,
            denialDate: denialData.denialDate || new Date().toISOString(),
            denialReason: denialData.reason,
            denialCode: denialData.code,
            appealStatus: "not_started",
            supportingDocuments: denialData.supportingDocuments || [],
            status: "active",
            lastModified: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            id,
            message: "Denial recorded locally",
          };
        }
      } catch (err) {
        console.error("Failed to record denial:", err);
        setError("Failed to record denial");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Submit appeal
  const submitAppeal = useCallback(
    async (appealData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - submit directly
          const result = await ApiService.submitAppeal(appealData);
          return result;
        } else {
          // Offline mode - update local denial record
          if (appealData.denialId) {
            // Find the denial in local storage
            const denials = await offlineService.getDenialManagementsByClaimId(
              appealData.claimId,
            );
            const denial = denials.find(
              (d) => d.denialId === appealData.denialId,
            );

            if (denial && denial.id) {
              await offlineService.updateDenialManagementStatus(
                denial.id,
                "active",
                "in_progress",
              );

              // Queue appeal submission for when online
              await offlineService.addToQueue({
                url: "/denials/appeal",
                method: "post",
                data: appealData,
                headers: { "Content-Type": "application/json" },
                timestamp: new Date().toISOString(),
              });

              return {
                success: true,
                offlineQueued: true,
                message: "Appeal queued for submission when online",
              };
            } else {
              throw new Error("Denial record not found locally");
            }
          } else {
            throw new Error("Denial ID is required");
          }
        }
      } catch (err) {
        console.error("Failed to submit appeal:", err);
        setError("Failed to submit appeal");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Generate revenue report
  const generateRevenueReport = useCallback(
    async (reportParams: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - generate directly
          const result = await ApiService.generateRevenueReport(reportParams);
          return result;
        } else {
          // Offline mode - save report parameters for later generation
          const id = await offlineService.saveRevenueReport({
            reportId: `report-${Date.now()}`,
            reportType: reportParams.reportType || "custom",
            startDate: reportParams.startDate,
            endDate: reportParams.endDate,
            totalClaims: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            deniedAmount: 0,
            adjustmentAmount: 0,
            collectionRate: 0,
            averageDaysToPayment: 0,
            status: "draft",
            lastModified: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            id,
            message: "Report parameters saved for generation when online",
          };
        }
      } catch (err) {
        console.error("Failed to generate revenue report:", err);
        setError("Failed to generate revenue report");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Enhanced Revenue Management Functions

  // Get payment reconciliation data
  const getPaymentReconciliation = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch payment reconciliation in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getPaymentReconciliation(params);
        return data;
      } catch (err) {
        console.error("Failed to fetch payment reconciliation:", err);
        setError("Failed to fetch payment reconciliation");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Process payment reconciliation
  const processPaymentReconciliation = useCallback(
    async (reconciliationData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          const result =
            await ApiService.processPaymentReconciliation(reconciliationData);
          return result;
        } else {
          // Offline mode - save locally
          const id = await offlineService.savePaymentReconciliation({
            reconciliationId: `recon-${Date.now()}`,
            ...reconciliationData,
            status: "pending",
            lastModified: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            id,
            message: "Reconciliation saved locally",
          };
        }
      } catch (err) {
        console.error("Failed to process payment reconciliation:", err);
        setError("Failed to process payment reconciliation");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Get payer performance analytics
  const getPayerPerformanceAnalytics = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch payer performance analytics in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getPayerPerformanceAnalytics(params);
        return data;
      } catch (err) {
        console.error("Failed to fetch payer performance analytics:", err);
        setError("Failed to fetch payer performance analytics");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Generate cash flow projection
  const generateCashFlowProjection = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot generate cash flow projection in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.generateCashFlowProjection(params);
        return data;
      } catch (err) {
        console.error("Failed to generate cash flow projection:", err);
        setError("Failed to generate cash flow projection");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Get KPI dashboard data
  const getKPIDashboard = useCallback(
    async (params?: any) => {
      if (!isOnline) {
        setError("Cannot fetch KPI dashboard in offline mode");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await ApiService.getKPIDashboard(params);
        return data;
      } catch (err) {
        console.error("Failed to fetch KPI dashboard:", err);
        setError("Failed to fetch KPI dashboard");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Submit batch claims
  const submitBatchClaims = useCallback(
    async (claimsData: any[]) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          const result = await ApiService.submitBatchClaims(claimsData);
          return result;
        } else {
          // Offline mode - queue all claims
          const batchId = `batch-${Date.now()}`;

          for (const claimData of claimsData) {
            await offlineService.addToQueue({
              url: "/claims/submit",
              method: "post",
              data: { ...claimData, batchId },
              headers: { "Content-Type": "application/json" },
              timestamp: new Date().toISOString(),
            });
          }

          return {
            success: true,
            offlineQueued: true,
            batchId,
            message: `${claimsData.length} claims queued for batch submission when online`,
          };
        }
      } catch (err) {
        console.error("Failed to submit batch claims:", err);
        setError("Failed to submit batch claims");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Update claim status
  const updateClaimStatus = useCallback(
    async (claimId: string, status: string, notes?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          const result = await ApiService.updateClaimStatus(
            claimId,
            status,
            notes,
          );
          return result;
        } else {
          // Offline mode - queue status update
          await offlineService.addToQueue({
            url: `/claims/${claimId}/status`,
            method: "patch",
            data: { status, notes, updatedAt: new Date().toISOString() },
            headers: { "Content-Type": "application/json" },
            timestamp: new Date().toISOString(),
          });

          return {
            success: true,
            offlineQueued: true,
            message: "Status update queued for when online",
          };
        }
      } catch (err) {
        console.error("Failed to update claim status:", err);
        setError("Failed to update claim status");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  return {
    isLoading,
    error,
    revenueAnalytics,
    accountsReceivableAging,
    denialAnalytics,
    fetchRevenueAnalytics,
    fetchAccountsReceivableAging,
    fetchDenialAnalytics,
    submitClaim,
    recordPayment,
    recordDenial,
    submitAppeal,
    generateRevenueReport,
    getPaymentReconciliation,
    processPaymentReconciliation,
    getPayerPerformanceAnalytics,
    generateCashFlowProjection,
    getKPIDashboard,
    submitBatchClaims,
    updateClaimStatus,
  };
}
