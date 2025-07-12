/**
 * Payment Processing Type Definitions
 * Comprehensive types for secure payment handling
 */

export interface PaymentGateway {
  id: string;
  name: string;
  type: "stripe" | "paypal" | "adcb" | "emirates_nbd" | "mashreq" | "daman_pay";
  isActive: boolean;
  supportedCurrencies: string[];
  supportedPaymentMethods: PaymentMethodType[];
  processingFee: number;
  settlementTime: string;
  apiEndpoint: string;
  webhookUrl?: string;
  configuration: {
    publicKey?: string;
    merchantId?: string;
    accountId?: string;
    environment: "sandbox" | "production";
  };
}

export interface PaymentMethodType {
  type:
    | "card"
    | "bank_transfer"
    | "digital_wallet"
    | "insurance_direct"
    | "cash";
  subtype?: string;
  displayName: string;
  icon?: string;
  isEnabled: boolean;
  minimumAmount?: number;
  maximumAmount?: number;
  processingTime: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  gatewayId: string;
  gatewayTransactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  patientId: string;
  claimId?: string;
  episodeId?: string;
  authorizationId?: string;
  description: string;
  metadata: {
    serviceType?: string;
    providerName?: string;
    serviceDate?: string;
    insuranceClaimNumber?: string;
    patientCopay?: number;
    insuranceCoverage?: number;
  };
  fees: {
    processingFee: number;
    gatewayFee: number;
    totalFees: number;
  };
  timeline: {
    initiatedAt: string;
    processedAt?: string;
    settledAt?: string;
    failedAt?: string;
    refundedAt?: string;
  };
  securityInfo: {
    encryptionMethod: string;
    tokenized: boolean;
    pciCompliant: boolean;
    fraudScore?: number;
    riskLevel: "low" | "medium" | "high";
  };
  auditTrail: PaymentAuditEntry[];
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "authorized"
  | "captured"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "disputed"
  | "chargeback";

export interface PaymentAuditEntry {
  timestamp: string;
  action: string;
  status: PaymentStatus;
  userId?: string;
  gatewayResponse?: any;
  errorCode?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PaymentReconciliation {
  id: string;
  reconciliationDate: string;
  gatewayId: string;
  totalTransactions: number;
  totalAmount: number;
  settledAmount: number;
  pendingAmount: number;
  discrepancies: PaymentDiscrepancy[];
  status: "pending" | "in_progress" | "completed" | "failed";
  processedBy?: string;
  completedAt?: string;
}

export interface PaymentDiscrepancy {
  transactionId: string;
  type:
    | "amount_mismatch"
    | "missing_transaction"
    | "duplicate_transaction"
    | "status_mismatch";
  description: string;
  expectedValue: any;
  actualValue: any;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface PaymentWebhook {
  id: string;
  gatewayId: string;
  eventType: string;
  eventData: any;
  signature: string;
  verified: boolean;
  processed: boolean;
  receivedAt: string;
  processedAt?: string;
  retryCount: number;
  lastRetryAt?: string;
  errorMessage?: string;
}

export interface PaymentConfiguration {
  defaultGateway: string;
  fallbackGateways: string[];
  routingRules: PaymentRoutingRule[];
  securitySettings: {
    encryptionEnabled: boolean;
    tokenizationEnabled: boolean;
    fraudDetectionEnabled: boolean;
    pciComplianceLevel: "level1" | "level2" | "level3" | "level4";
    maxRetryAttempts: number;
    timeoutSeconds: number;
  };
  reconciliationSettings: {
    autoReconcileEnabled: boolean;
    reconciliationFrequency: "hourly" | "daily" | "weekly";
    discrepancyThreshold: number;
    notificationEnabled: boolean;
  };
}

export interface PaymentRoutingRule {
  id: string;
  name: string;
  conditions: {
    amountRange?: { min: number; max: number };
    currency?: string[];
    paymentMethod?: string[];
    patientType?: string[];
    insuranceProvider?: string[];
  };
  preferredGateway: string;
  fallbackGateways: string[];
  isActive: boolean;
  priority: number;
}

export interface PaymentAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalTransactions: number;
    totalAmount: number;
    averageTransactionAmount: number;
    successRate: number;
    failureRate: number;
    refundRate: number;
    averageProcessingTime: number;
    totalFees: number;
  };
  gatewayPerformance: {
    gatewayId: string;
    gatewayName: string;
    transactionCount: number;
    successRate: number;
    averageProcessingTime: number;
    totalFees: number;
    uptime: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    transactions: number;
    amount: number;
    successRate: number;
  }[];
}

export interface PaymentError {
  code: string;
  message: string;
  type: "validation" | "gateway" | "network" | "security" | "business";
  severity: "low" | "medium" | "high" | "critical";
  retryable: boolean;
  details?: any;
  timestamp: string;
}

export interface PaymentNotification {
  id: string;
  type:
    | "payment_completed"
    | "payment_failed"
    | "refund_processed"
    | "dispute_created"
    | "reconciliation_completed";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  recipients: string[];
  channels: ("email" | "sms" | "push" | "webhook")[];
  data: any;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}
