/**
 * Payment Processing Hook
 * Manages payment operations with multiple gateways
 */

import { useState, useCallback, useEffect } from "react";
import {
  paymentGatewayService,
  PaymentRequest,
  PaymentResponse,
} from "@/services/payment-gateway.service";
import {
  PaymentTransaction,
  PaymentGateway,
  PaymentStatus,
  PaymentError,
} from "@/types/payment";
import { useToast } from "@/hooks/useToast";

interface UsePaymentProcessingReturn {
  // State
  isProcessing: boolean;
  currentTransaction: PaymentTransaction | null;
  paymentHistory: PaymentTransaction[];
  availableGateways: PaymentGateway[];
  selectedGateway: PaymentGateway | null;
  error: PaymentError | null;

  // Actions
  processPayment: (
    request: PaymentRequest,
    gatewayId?: string,
  ) => Promise<PaymentResponse>;
  checkPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
  processRefund: (
    paymentId: string,
    amount?: number,
    reason?: string,
  ) => Promise<PaymentResponse>;
  selectGateway: (gatewayId: string) => void;
  retryPayment: (paymentId: string) => Promise<PaymentResponse>;
  cancelPayment: (paymentId: string) => Promise<boolean>;

  // Utilities
  getOptimalGateway: (
    amount: number,
    currency: string,
    paymentMethod: string,
  ) => PaymentGateway | null;
  validatePaymentData: (request: PaymentRequest) => {
    isValid: boolean;
    errors: string[];
  };
  calculateFees: (
    amount: number,
    gatewayId: string,
  ) => { processingFee: number; totalAmount: number };

  // Analytics
  getPaymentAnalytics: (period: {
    startDate: string;
    endDate: string;
  }) => Promise<any>;
  getGatewayPerformance: () => Promise<any>;
}

export const usePaymentProcessing = (): UsePaymentProcessingReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<PaymentTransaction | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    [],
  );
  const [availableGateways, setAvailableGateways] = useState<PaymentGateway[]>(
    [],
  );
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(
    null,
  );
  const [error, setError] = useState<PaymentError | null>(null);
  const { toast } = useToast();

  // Mock gateway configurations
  const mockGateways: PaymentGateway[] = [
    {
      id: "stripe_ae",
      name: "Stripe UAE",
      type: "stripe",
      isActive: true,
      supportedCurrencies: ["AED", "USD"],
      supportedPaymentMethods: [
        {
          type: "card",
          displayName: "Credit/Debit Card",
          isEnabled: true,
          processingTime: "2-3 seconds",
        },
        {
          type: "digital_wallet",
          displayName: "Apple Pay / Google Pay",
          isEnabled: true,
          processingTime: "1-2 seconds",
        },
      ],
      processingFee: 2.9,
      settlementTime: "2-7 business days",
      apiEndpoint: "https://api.stripe.com/v1",
      configuration: {
        publicKey: "pk_test_stripe_ae",
        environment: "sandbox",
      },
    },
    {
      id: "adcb_gateway",
      name: "ADCB Payment Gateway",
      type: "adcb",
      isActive: true,
      supportedCurrencies: ["AED"],
      supportedPaymentMethods: [
        {
          type: "card",
          displayName: "ADCB Cards",
          isEnabled: true,
          processingTime: "3-5 seconds",
        },
        {
          type: "bank_transfer",
          displayName: "Bank Transfer",
          isEnabled: true,
          processingTime: "1-2 business days",
        },
      ],
      processingFee: 2.5,
      settlementTime: "1-3 business days",
      apiEndpoint: "https://api.adcb.com/payments",
      configuration: {
        merchantId: "ADCB_MERCHANT_001",
        environment: "sandbox",
      },
    },
    {
      id: "emirates_nbd",
      name: "Emirates NBD Gateway",
      type: "emirates_nbd",
      isActive: true,
      supportedCurrencies: ["AED", "USD"],
      supportedPaymentMethods: [
        {
          type: "card",
          displayName: "Emirates NBD Cards",
          isEnabled: true,
          processingTime: "2-4 seconds",
        },
        {
          type: "digital_wallet",
          displayName: "NBD Digital Wallet",
          isEnabled: true,
          processingTime: "1-3 seconds",
        },
      ],
      processingFee: 2.7,
      settlementTime: "1-2 business days",
      apiEndpoint: "https://api.emiratesnbd.com/gateway",
      configuration: {
        merchantId: "ENBD_MERCHANT_001",
        environment: "sandbox",
      },
    },
    {
      id: "daman_direct",
      name: "DAMAN Direct Pay",
      type: "daman_pay",
      isActive: true,
      supportedCurrencies: ["AED"],
      supportedPaymentMethods: [
        {
          type: "insurance_direct",
          displayName: "Insurance Direct Payment",
          isEnabled: true,
          processingTime: "5-10 seconds",
        },
      ],
      processingFee: 1.5,
      settlementTime: "3-5 business days",
      apiEndpoint: "https://api.daman.ae/payments",
      configuration: {
        accountId: "DAMAN_ACCOUNT_001",
        environment: "sandbox",
      },
    },
  ];

  // Initialize gateways
  useEffect(() => {
    setAvailableGateways(mockGateways);
    setSelectedGateway(mockGateways[0]); // Default to first gateway
  }, []);

  // Process payment with selected or optimal gateway
  const processPayment = useCallback(
    async (
      request: PaymentRequest,
      gatewayId?: string,
    ): Promise<PaymentResponse> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Validate payment data
        const validation = validatePaymentData(request);
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }

        // Select optimal gateway if not specified
        const gateway = gatewayId
          ? availableGateways.find((g) => g.id === gatewayId)
          : getOptimalGateway(
              request.amount,
              request.currency,
              request.paymentMethod,
            );

        if (!gateway) {
          throw new Error("No suitable payment gateway available");
        }

        // Create transaction record
        const transaction: PaymentTransaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          gatewayId: gateway.id,
          amount: request.amount,
          currency: request.currency,
          status: "pending",
          paymentMethod:
            gateway.supportedPaymentMethods.find(
              (pm) => pm.type === request.paymentMethod,
            ) || gateway.supportedPaymentMethods[0],
          patientId: request.patientId,
          claimId: request.metadata?.claimId,
          episodeId: request.metadata?.episodeId,
          authorizationId: request.metadata?.authorizationId,
          description: request.description,
          metadata: {
            serviceType: "homecare",
            serviceDate: new Date().toISOString().split("T")[0],
          },
          fees: calculateFees(request.amount, gateway.id),
          timeline: {
            initiatedAt: new Date().toISOString(),
          },
          securityInfo: {
            encryptionMethod: "AES-256",
            tokenized: true,
            pciCompliant: true,
            riskLevel: "low",
          },
          auditTrail: [
            {
              timestamp: new Date().toISOString(),
              action: "payment_initiated",
              status: "pending",
              userId: "current_user",
            },
          ],
        };

        setCurrentTransaction(transaction);

        // Process payment through gateway service
        const response = await paymentGatewayService.processPayment(request);

        // Update transaction with response
        const updatedTransaction = {
          ...transaction,
          status: response.status as PaymentStatus,
          gatewayTransactionId: response.transactionId,
          timeline: {
            ...transaction.timeline,
            processedAt: response.processedAt,
          },
          auditTrail: [
            ...transaction.auditTrail,
            {
              timestamp: new Date().toISOString(),
              action: "payment_processed",
              status: response.status as PaymentStatus,
              gatewayResponse: response.gatewayResponse,
            },
          ],
        };

        setCurrentTransaction(updatedTransaction);
        setPaymentHistory((prev) => [updatedTransaction, ...prev]);

        if (response.status === "completed") {
          toast({
            title: "Payment Successful",
            description: `Payment of ${request.currency} ${request.amount} processed successfully`,
            variant: "default",
          });
        } else if (response.status === "failed") {
          toast({
            title: "Payment Failed",
            description: response.errorMessage || "Payment processing failed",
            variant: "destructive",
          });
        }

        return response;
      } catch (error: any) {
        const paymentError: PaymentError = {
          code: error.code || "PAYMENT_ERROR",
          message: error.message || "Payment processing failed",
          type: "gateway",
          severity: "high",
          retryable: true,
          timestamp: new Date().toISOString(),
        };

        setError(paymentError);
        toast({
          title: "Payment Error",
          description: paymentError.message,
          variant: "destructive",
        });

        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [availableGateways, toast],
  );

  // Check payment status
  const checkPaymentStatus = useCallback(
    async (paymentId: string): Promise<PaymentStatus> => {
      try {
        const response =
          await paymentGatewayService.getPaymentStatus(paymentId);
        return response.status as PaymentStatus;
      } catch (error) {
        console.error("Error checking payment status:", error);
        throw error;
      }
    },
    [],
  );

  // Process refund
  const processRefund = useCallback(
    async (
      paymentId: string,
      amount?: number,
      reason: string = "Customer request",
    ): Promise<PaymentResponse> => {
      try {
        const response = await paymentGatewayService.processRefund({
          paymentId,
          amount,
          reason,
          requestedBy: "current_user",
        });

        toast({
          title: "Refund Processed",
          description: `Refund of ${amount ? `${amount}` : "full amount"} initiated successfully`,
          variant: "default",
        });

        return response;
      } catch (error: any) {
        toast({
          title: "Refund Failed",
          description: error.message || "Refund processing failed",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast],
  );

  // Select gateway
  const selectGateway = useCallback(
    (gatewayId: string) => {
      const gateway = availableGateways.find((g) => g.id === gatewayId);
      if (gateway) {
        setSelectedGateway(gateway);
      }
    },
    [availableGateways],
  );

  // Retry payment
  const retryPayment = useCallback(
    async (paymentId: string): Promise<PaymentResponse> => {
      const transaction = paymentHistory.find((t) => t.paymentId === paymentId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const retryRequest: PaymentRequest = {
        amount: transaction.amount,
        currency: transaction.currency,
        patientId: transaction.patientId,
        serviceId: transaction.claimId || "unknown",
        description: transaction.description,
        paymentMethod: transaction.paymentMethod.type,
        metadata: {
          claimId: transaction.claimId,
          episodeId: transaction.episodeId,
          authorizationId: transaction.authorizationId,
        },
      };

      return processPayment(retryRequest, transaction.gatewayId);
    },
    [paymentHistory, processPayment],
  );

  // Cancel payment
  const cancelPayment = useCallback(
    async (paymentId: string): Promise<boolean> => {
      try {
        // Implementation would depend on gateway capabilities
        // For now, just update local state
        setPaymentHistory((prev) =>
          prev.map((t) =>
            t.paymentId === paymentId
              ? { ...t, status: "cancelled" as PaymentStatus }
              : t,
          ),
        );

        toast({
          title: "Payment Cancelled",
          description: "Payment has been cancelled successfully",
          variant: "default",
        });

        return true;
      } catch (error) {
        console.error("Error cancelling payment:", error);
        return false;
      }
    },
    [toast],
  );

  // Get optimal gateway based on criteria
  const getOptimalGateway = useCallback(
    (
      amount: number,
      currency: string,
      paymentMethod: string,
    ): PaymentGateway | null => {
      const suitableGateways = availableGateways.filter(
        (gateway) =>
          gateway.isActive &&
          gateway.supportedCurrencies.includes(currency) &&
          gateway.supportedPaymentMethods.some(
            (pm) => pm.type === paymentMethod && pm.isEnabled,
          ),
      );

      if (suitableGateways.length === 0) return null;

      // Sort by processing fee (lowest first) and settlement time
      return suitableGateways.sort((a, b) => {
        if (a.processingFee !== b.processingFee) {
          return a.processingFee - b.processingFee;
        }
        return a.settlementTime.localeCompare(b.settlementTime);
      })[0];
    },
    [availableGateways],
  );

  // Validate payment data
  const validatePaymentData = useCallback(
    (request: PaymentRequest): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (!request.amount || request.amount <= 0) {
        errors.push("Amount must be greater than 0");
      }

      if (!request.currency || !["AED", "USD"].includes(request.currency)) {
        errors.push("Invalid currency");
      }

      if (!request.patientId) {
        errors.push("Patient ID is required");
      }

      if (!request.serviceId) {
        errors.push("Service ID is required");
      }

      if (!request.description) {
        errors.push("Payment description is required");
      }

      if (!request.paymentMethod) {
        errors.push("Payment method is required");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  // Calculate fees
  const calculateFees = useCallback(
    (
      amount: number,
      gatewayId: string,
    ): { processingFee: number; totalAmount: number } => {
      const gateway = availableGateways.find((g) => g.id === gatewayId);
      if (!gateway) {
        return { processingFee: 0, totalAmount: amount };
      }

      const processingFee = (amount * gateway.processingFee) / 100;
      const gatewayFee = 0; // Additional gateway-specific fees
      const totalFees = processingFee + gatewayFee;

      return {
        processingFee: totalFees,
        totalAmount: amount + totalFees,
      };
    },
    [availableGateways],
  );

  // Get payment analytics
  const getPaymentAnalytics = useCallback(
    async (period: { startDate: string; endDate: string }) => {
      // Mock analytics data
      return {
        totalTransactions: paymentHistory.length,
        totalAmount: paymentHistory.reduce((sum, t) => sum + t.amount, 0),
        successRate:
          (paymentHistory.filter((t) => t.status === "completed").length /
            paymentHistory.length) *
          100,
        averageAmount:
          paymentHistory.reduce((sum, t) => sum + t.amount, 0) /
          paymentHistory.length,
      };
    },
    [paymentHistory],
  );

  // Get gateway performance
  const getGatewayPerformance = useCallback(async () => {
    const performance = availableGateways.map((gateway) => {
      const gatewayTransactions = paymentHistory.filter(
        (t) => t.gatewayId === gateway.id,
      );
      const successfulTransactions = gatewayTransactions.filter(
        (t) => t.status === "completed",
      );

      return {
        gatewayId: gateway.id,
        gatewayName: gateway.name,
        transactionCount: gatewayTransactions.length,
        successRate:
          gatewayTransactions.length > 0
            ? (successfulTransactions.length / gatewayTransactions.length) * 100
            : 0,
        averageProcessingTime: 2.5, // Mock data
        totalFees: gatewayTransactions.reduce(
          (sum, t) => sum + t.fees.totalFees,
          0,
        ),
        uptime: 99.9, // Mock data
      };
    });

    return performance;
  }, [availableGateways, paymentHistory]);

  return {
    // State
    isProcessing,
    currentTransaction,
    paymentHistory,
    availableGateways,
    selectedGateway,
    error,

    // Actions
    processPayment,
    checkPaymentStatus,
    processRefund,
    selectGateway,
    retryPayment,
    cancelPayment,

    // Utilities
    getOptimalGateway,
    validatePaymentData,
    calculateFees,

    // Analytics
    getPaymentAnalytics,
    getGatewayPerformance,
  };
};

export default usePaymentProcessing;
