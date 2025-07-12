/**
 * Payment Gateway Integration Service
 * Handles secure payment processing for homecare services
 */

import { AuditLogger } from "./security.service";
import { API_GATEWAY_CONFIG } from "@/config/api.config";

export interface PaymentRequest {
  amount: number;
  currency: "AED" | "USD";
  patientId: string;
  serviceId: string;
  description: string;
  paymentMethod: "card" | "bank_transfer" | "insurance" | "cash";
  metadata?: {
    episodeId?: string;
    authorizationId?: string;
    claimId?: string;
  };
}

export interface PaymentResponse {
  paymentId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  transactionId?: string;
  gatewayResponse?: any;
  receiptUrl?: string;
  errorMessage?: string;
  processedAt?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
  requestedBy: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountType?: string;
  isDefault: boolean;
  isVerified: boolean;
}

class PaymentGatewayService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  constructor() {
    this.apiUrl =
      process.env.PAYMENT_GATEWAY_URL || "https://api.payment-gateway.ae";
    this.apiKey = process.env.PAYMENT_GATEWAY_API_KEY || "";
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "";
  }

  async processPayment(
    paymentRequest: PaymentRequest,
  ): Promise<PaymentResponse> {
    try {
      this.validatePaymentRequest(paymentRequest);
      const encryptedRequest = await this.encryptPaymentData(paymentRequest);

      const response = await fetch(`${this.apiUrl}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-API-Version": "2024-01",
          "X-Idempotency-Key": this.generateIdempotencyKey(paymentRequest),
        },
        body: JSON.stringify(encryptedRequest),
      });

      if (!response.ok) {
        throw new Error(`Payment processing failed: ${response.statusText}`);
      }

      const paymentResponse: PaymentResponse = await response.json();

      AuditLogger.logSecurityEvent({
        type: "payment_processed",
        details: {
          paymentId: paymentResponse.paymentId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: paymentResponse.status,
          patientId: paymentRequest.patientId,
        },
        severity: "low",
        complianceImpact: true,
      });

      return paymentResponse;
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting payment status:", error);
      throw error;
    }
  }

  async processRefund(refundRequest: RefundRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/payments/${refundRequest.paymentId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key":
              this.generateRefundIdempotencyKey(refundRequest),
          },
          body: JSON.stringify({
            amount: refundRequest.amount,
            reason: refundRequest.reason,
            requestedBy: refundRequest.requestedBy,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Refund processing failed: ${response.statusText}`);
      }

      const refundResponse: PaymentResponse = await response.json();

      AuditLogger.logSecurityEvent({
        type: "refund_processed",
        details: {
          originalPaymentId: refundRequest.paymentId,
          refundId: refundResponse.paymentId,
          amount: refundRequest.amount,
          reason: refundRequest.reason,
          requestedBy: refundRequest.requestedBy,
        },
        severity: "low",
        complianceImpact: true,
      });

      return refundResponse;
    } catch (error) {
      console.error("Refund processing error:", error);
      throw error;
    }
  }

  private validatePaymentRequest(request: PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error("Invalid payment amount");
    }
    if (!request.patientId) {
      throw new Error("Patient ID is required");
    }
    if (!request.serviceId) {
      throw new Error("Service ID is required");
    }
    if (!request.description) {
      throw new Error("Payment description is required");
    }
  }

  private async encryptPaymentData(data: PaymentRequest): Promise<any> {
    return {
      ...data,
      _encrypted: true,
      _timestamp: new Date().toISOString(),
    };
  }

  private generateIdempotencyKey(request: PaymentRequest): string {
    const key = `${request.patientId}-${request.serviceId}-${request.amount}-${Date.now()}`;
    return btoa(key)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 32);
  }

  private generateRefundIdempotencyKey(request: RefundRequest): string {
    const key = `refund-${request.paymentId}-${request.amount || "full"}-${Date.now()}`;
    return btoa(key)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 32);
  }
}

export const paymentGatewayService = new PaymentGatewayService();
export default PaymentGatewayService;
