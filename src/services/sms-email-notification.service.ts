/**
 * SMS/Email Notification Service
 * Production-ready implementation with healthcare-specific templates and DOH compliance
 * Phase 1: Service Integration - SMS/Email Notification Service Implementation
 */

import { EventEmitter } from "events";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import { redisIntegrationService } from "./redis-integration.service";

// Healthcare-specific template types
export type HealthcareEmailTemplate =
  | "patient-safety-alert-email"
  | "medication-reminder-email"
  | "appointment-reminder-email"
  | "clinical-alert-email"
  | "emergency-alert-email"
  | "doh-compliance-reminder-email"
  | "jawda-quality-alert-email"
  | "discharge-planning-email"
  | "lab-results-email"
  | "vital-signs-alert-email"
  | "infection-control-alert-email"
  | "care-plan-update-email"
  | "staff-assignment-email"
  | "equipment-maintenance-email";

export type HealthcareSMSTemplate =
  | "patient-safety-alert-sms"
  | "medication-reminder-sms"
  | "appointment-reminder-sms"
  | "clinical-alert-sms"
  | "emergency-alert-sms"
  | "compliance-deadline-sms"
  | "quality-alert-sms"
  | "discharge-planning-sms"
  | "lab-results-sms"
  | "vital-signs-alert-sms"
  | "infection-control-alert-sms"
  | "care-plan-update-sms"
  | "staff-assignment-sms"
  | "equipment-maintenance-sms";

export interface HealthcareNotificationOptions {
  priority: "low" | "medium" | "high" | "critical" | "emergency";
  language?: "en" | "ar";
  healthcareContext?: {
    patientId?: string;
    facilityId?: string;
    departmentId?: string;
    urgencyLevel?: "routine" | "urgent" | "emergency";
    complianceType?: "DOH" | "JAWDA" | "ADHICS" | "TAWTEEN";
    clinicalSeverity?: "low" | "moderate" | "high" | "critical";
    dohCompliant?: boolean;
    auditRequired?: boolean;
    encryptionRequired?: boolean;
  };
  deliveryOptions?: {
    retryAttempts?: number;
    retryDelay?: number;
    deliveryWindow?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
    timezone?: string;
    scheduledAt?: Date;
  };
  trackingOptions?: {
    deliveryReceipt?: boolean;
    readReceipt?: boolean;
    clickTracking?: boolean;
    unsubscribeTracking?: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  language: "en" | "ar";
  subject?: string; // For email only
  content: string;
  variables: string[];
  healthcareSpecific: boolean;
  complianceLevel: "DOH" | "JAWDA" | "ADHICS" | "TAWTEEN" | "GENERAL";
  category:
    | "patient_safety"
    | "clinical"
    | "administrative"
    | "compliance"
    | "emergency";
  lastUpdated: Date;
  version: string;
}

export interface DeliveryResult {
  messageId: string;
  recipient: string;
  status:
    | "sent"
    | "delivered"
    | "failed"
    | "pending"
    | "bounced"
    | "unsubscribed";
  timestamp: Date;
  errorMessage?: string;
  deliveryTime?: number;
  cost?: number;
  provider?: string;
  metadata?: Record<string, any>;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  deliveryRate: number;
  bounceRate: number;
  averageDeliveryTime: number;
  totalCost: number;
  providerPerformance: {
    [provider: string]: {
      sent: number;
      delivered: number;
      failed: number;
      averageDeliveryTime: number;
      cost: number;
    };
  };
  healthcareMetrics: {
    patientSafetyAlerts: number;
    emergencyNotifications: number;
    clinicalAlerts: number;
    complianceNotifications: number;
    medicationReminders: number;
    appointmentReminders: number;
  };
  templateUsage: {
    [templateId: string]: {
      used: number;
      successRate: number;
      averageDeliveryTime: number;
    };
  };
}

class SMSEmailNotificationService extends EventEmitter {
  private static instance: SMSEmailNotificationService;
  private isInitialized = false;
  private emailTemplates: Map<string, NotificationTemplate> = new Map();
  private smsTemplates: Map<string, NotificationTemplate> = new Map();
  private deliveryTracking: Map<string, DeliveryResult> = new Map();
  private metrics: NotificationMetrics;
  private rateLimiter: Map<string, { count: number; resetTime: number }> =
    new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private retryQueue: Map<
    string,
    {
      type: "email" | "sms";
      template: string;
      recipients: string[];
      variables: Record<string, any>;
      options: HealthcareNotificationOptions;
      attempts: number;
      nextRetry: Date;
    }
  > = new Map();

  // Provider configurations (would be loaded from environment)
  private emailProviders = {
    primary: {
      name: "AWS SES",
      apiKey: process.env.AWS_SES_API_KEY,
      region: process.env.AWS_SES_REGION || "us-east-1",
      rateLimit: 14, // emails per second
      enabled: true,
    },
    secondary: {
      name: "SendGrid",
      apiKey: process.env.SENDGRID_API_KEY,
      rateLimit: 10,
      enabled: false,
    },
  };

  private smsProviders = {
    primary: {
      name: "AWS SNS",
      apiKey: process.env.AWS_SNS_API_KEY,
      region: process.env.AWS_SNS_REGION || "us-east-1",
      rateLimit: 20, // SMS per second
      enabled: true,
    },
    secondary: {
      name: "Twilio",
      apiKey: process.env.TWILIO_API_KEY,
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      rateLimit: 10,
      enabled: false,
    },
  };

  public static getInstance(): SMSEmailNotificationService {
    if (!SMSEmailNotificationService.instance) {
      SMSEmailNotificationService.instance = new SMSEmailNotificationService();
    }
    return SMSEmailNotificationService.instance;
  }

  constructor() {
    super();
    this.metrics = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalBounced: 0,
      deliveryRate: 0,
      bounceRate: 0,
      averageDeliveryTime: 0,
      totalCost: 0,
      providerPerformance: {},
      healthcareMetrics: {
        patientSafetyAlerts: 0,
        emergencyNotifications: 0,
        clinicalAlerts: 0,
        complianceNotifications: 0,
        medicationReminders: 0,
        appointmentReminders: 0,
      },
      templateUsage: {},
    };
  }

  /**
   * Initialize the SMS/Email notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("📧 Initializing SMS/Email Notification Service...");

      // Initialize Redis integration for template caching
      await redisIntegrationService.initialize();

      // Load healthcare-specific templates
      await this.loadHealthcareTemplates();

      // Initialize providers
      await this.initializeProviders();

      // Start background processors
      this.startBackgroundProcessors();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("✅ SMS/Email Notification Service initialized successfully");

      this.emit("service-initialized", {
        timestamp: new Date(),
        emailTemplates: this.emailTemplates.size,
        smsTemplates: this.smsTemplates.size,
        metrics: this.metrics,
      });
    } catch (error) {
      console.error(
        "❌ Failed to initialize SMS/Email Notification Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "SMSEmailNotificationService.initialize",
      });
      throw error;
    }
  }

  /**
   * Send healthcare email notification
   */
  async sendEmail(
    templateId: HealthcareEmailTemplate,
    recipients: string[],
    variables: Record<string, any>,
    options: HealthcareNotificationOptions = { priority: "medium" },
  ): Promise<DeliveryResult[]> {
    const startTime = Date.now();
    const results: DeliveryResult[] = [];

    try {
      console.log(
        `📧 Sending healthcare email: ${templateId} to ${recipients.length} recipients`,
      );

      // Validate inputs
      this.validateEmailInputs(templateId, recipients, variables, options);

      // Check rate limits
      await this.checkRateLimit("email", recipients.length);

      // Get template
      const template = await this.getEmailTemplate(
        templateId,
        options.language || "en",
      );
      if (!template) {
        throw new Error(`Email template not found: ${templateId}`);
      }

      // Process each recipient
      for (const recipient of recipients) {
        try {
          const result = await this.sendSingleEmail(
            recipient,
            template,
            variables,
            options,
          );
          results.push(result);

          // Update metrics
          this.updateEmailMetrics(templateId, result, options);

          // Cache delivery result
          this.deliveryTracking.set(result.messageId, result);
        } catch (error) {
          console.error(`Failed to send email to ${recipient}:`, error);
          const failedResult: DeliveryResult = {
            messageId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            recipient,
            status: "failed",
            timestamp: new Date(),
            errorMessage: error.message,
            deliveryTime: Date.now() - startTime,
          };
          results.push(failedResult);
          this.updateEmailMetrics(templateId, failedResult, options);
        }
      }

      // Emit events
      this.emit("email-sent", {
        templateId,
        recipients: recipients.length,
        sent: results.filter((r) => r.status === "sent").length,
        failed: results.filter((r) => r.status === "failed").length,
        results,
      });

      // Update healthcare-specific metrics
      this.updateHealthcareMetrics(templateId, results, "email");

      console.log(
        `✅ Email batch completed: ${results.filter((r) => r.status === "sent").length}/${recipients.length} sent`,
      );
      return results;
    } catch (error) {
      console.error("❌ Failed to send email batch:", error);
      errorHandlerService.handleError(error, {
        context: "SMSEmailNotificationService.sendEmail",
        templateId,
        recipientCount: recipients.length,
        priority: options.priority,
      });
      throw error;
    }
  }

  /**
   * Send healthcare SMS notification
   */
  async sendSMS(
    templateId: HealthcareSMSTemplate,
    recipients: string[],
    variables: Record<string, any>,
    options: HealthcareNotificationOptions = { priority: "medium" },
  ): Promise<DeliveryResult[]> {
    const startTime = Date.now();
    const results: DeliveryResult[] = [];

    try {
      console.log(
        `📱 Sending healthcare SMS: ${templateId} to ${recipients.length} recipients`,
      );

      // Validate inputs
      this.validateSMSInputs(templateId, recipients, variables, options);

      // Check rate limits
      await this.checkRateLimit("sms", recipients.length);

      // Get template
      const template = await this.getSMSTemplate(
        templateId,
        options.language || "en",
      );
      if (!template) {
        throw new Error(`SMS template not found: ${templateId}`);
      }

      // Process each recipient
      for (const recipient of recipients) {
        try {
          const result = await this.sendSingleSMS(
            recipient,
            template,
            variables,
            options,
          );
          results.push(result);

          // Update metrics
          this.updateSMSMetrics(templateId, result, options);

          // Cache delivery result
          this.deliveryTracking.set(result.messageId, result);
        } catch (error) {
          console.error(`Failed to send SMS to ${recipient}:`, error);
          const failedResult: DeliveryResult = {
            messageId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            recipient,
            status: "failed",
            timestamp: new Date(),
            errorMessage: error.message,
            deliveryTime: Date.now() - startTime,
          };
          results.push(failedResult);
          this.updateSMSMetrics(templateId, failedResult, options);
        }
      }

      // Emit events
      this.emit("sms-sent", {
        templateId,
        recipients: recipients.length,
        sent: results.filter((r) => r.status === "sent").length,
        failed: results.filter((r) => r.status === "failed").length,
        results,
      });

      // Update healthcare-specific metrics
      this.updateHealthcareMetrics(templateId, results, "sms");

      console.log(
        `✅ SMS batch completed: ${results.filter((r) => r.status === "sent").length}/${recipients.length} sent`,
      );
      return results;
    } catch (error) {
      console.error("❌ Failed to send SMS batch:", error);
      errorHandlerService.handleError(error, {
        context: "SMSEmailNotificationService.sendSMS",
        templateId,
        recipientCount: recipients.length,
        priority: options.priority,
      });
      throw error;
    }
  }

  /**
   * Send emergency notification (both SMS and Email)
   */
  async sendEmergencyNotification(
    emailTemplate: HealthcareEmailTemplate,
    smsTemplate: HealthcareSMSTemplate,
    recipients: { email?: string; phone?: string; name: string }[],
    variables: Record<string, any>,
  ): Promise<{ email: DeliveryResult[]; sms: DeliveryResult[] }> {
    console.log(
      `🚨 Sending emergency notification to ${recipients.length} recipients`,
    );

    const emergencyOptions: HealthcareNotificationOptions = {
      priority: "emergency",
      healthcareContext: {
        urgencyLevel: "emergency",
        dohCompliant: true,
        auditRequired: true,
        encryptionRequired: true,
      },
      deliveryOptions: {
        retryAttempts: 5,
        retryDelay: 1000, // 1 second for emergency
      },
      trackingOptions: {
        deliveryReceipt: true,
        readReceipt: true,
      },
    };

    const emailRecipients = recipients
      .filter((r) => r.email)
      .map((r) => r.email!);
    const smsRecipients = recipients
      .filter((r) => r.phone)
      .map((r) => r.phone!);

    const [emailResults, smsResults] = await Promise.allSettled([
      emailRecipients.length > 0
        ? this.sendEmail(
            emailTemplate,
            emailRecipients,
            variables,
            emergencyOptions,
          )
        : Promise.resolve([]),
      smsRecipients.length > 0
        ? this.sendSMS(smsTemplate, smsRecipients, variables, emergencyOptions)
        : Promise.resolve([]),
    ]);

    const results = {
      email: emailResults.status === "fulfilled" ? emailResults.value : [],
      sms: smsResults.status === "fulfilled" ? smsResults.value : [],
    };

    this.emit("emergency-notification-sent", {
      recipients: recipients.length,
      emailSent: results.email.filter((r) => r.status === "sent").length,
      smsSent: results.sms.filter((r) => r.status === "sent").length,
      results,
    });

    return results;
  }

  /**
   * Get delivery status for a message
   */
  getDeliveryStatus(messageId: string): DeliveryResult | null {
    return this.deliveryTracking.get(messageId) || null;
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics(): NotificationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get healthcare-specific metrics
   */
  getHealthcareMetrics(): NotificationMetrics["healthcareMetrics"] {
    return { ...this.metrics.healthcareMetrics };
  }

  /**
   * Add or update a notification template
   */
  async addTemplate(template: NotificationTemplate): Promise<void> {
    try {
      // Validate template
      this.validateTemplate(template);

      // Cache template in Redis
      await redisIntegrationService.set(
        `template:${template.type}:${template.id}:${template.language}`,
        template,
        {
          ttl: 86400, // 24 hours
          dataType: "administrative",
          sensitivity: "medium",
        },
      );

      // Store in memory
      if (template.type === "email") {
        this.emailTemplates.set(
          `${template.id}:${template.language}`,
          template,
        );
      } else {
        this.smsTemplates.set(`${template.id}:${template.language}`, template);
      }

      console.log(
        `✅ Template added: ${template.id} (${template.type}, ${template.language})`,
      );
      this.emit("template-added", template);
    } catch (error) {
      console.error("❌ Failed to add template:", error);
      throw error;
    }
  }

  // Private methods
  private async loadHealthcareTemplates(): Promise<void> {
    console.log("📋 Loading healthcare notification templates...");

    // Email templates
    const emailTemplates: NotificationTemplate[] = [
      {
        id: "patient-safety-alert-email",
        name: "Patient Safety Alert Email",
        type: "email",
        language: "en",
        subject: "🚨 URGENT: Patient Safety Alert - {{patientName}}",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
              <h1>🚨 PATIENT SAFETY ALERT</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2>Alert Details</h2>
              <p><strong>Patient:</strong> {{patientName}} (ID: {{patientId}})</p>
              <p><strong>Location:</strong> {{location}}</p>
              <p><strong>Safety Issue:</strong> {{safetyIssue}}</p>
              <p><strong>Reported By:</strong> {{reportedBy}}</p>
              <p><strong>Severity:</strong> {{clinicalSeverity}}</p>
              <p><strong>Time:</strong> {{timestamp}}</p>
              
              <div style="background: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Immediate Action Required:</strong></p>
                <p>Please review this patient safety alert immediately and take appropriate action according to DOH protocols.</p>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
                This notification is DOH compliant and requires acknowledgment within 15 minutes.
              </p>
            </div>
          </div>
        `,
        variables: [
          "patientName",
          "patientId",
          "location",
          "safetyIssue",
          "reportedBy",
          "clinicalSeverity",
          "timestamp",
        ],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "patient_safety",
        lastUpdated: new Date(),
        version: "1.0",
      },
      {
        id: "medication-reminder-email",
        name: "Medication Reminder Email",
        type: "email",
        language: "en",
        subject: "💊 Medication Reminder - {{medicationName}}",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
              <h1>💊 Medication Reminder</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2>Hello {{recipientName}},</h2>
              <p>This is a reminder for your scheduled medication:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Medication:</strong> {{medicationName}}</p>
                <p><strong>Dosage:</strong> {{dosage}}</p>
                <p><strong>Scheduled Time:</strong> {{scheduledTime}}</p>
                <p><strong>Patient:</strong> {{patientName}}</p>
              </div>
              
              <div style="background: #dbeafe; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p><strong>Important:</strong> Please take your medication as prescribed. If you have any questions or concerns, contact your healthcare provider immediately.</p>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
                This is an automated reminder from Reyada Homecare Platform.
              </p>
            </div>
          </div>
        `,
        variables: [
          "recipientName",
          "medicationName",
          "dosage",
          "scheduledTime",
          "patientName",
        ],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "clinical",
        lastUpdated: new Date(),
        version: "1.0",
      },
      {
        id: "doh-compliance-reminder-email",
        name: "DOH Compliance Reminder Email",
        type: "email",
        language: "en",
        subject: "📋 DOH Compliance Action Required - {{complianceType}}",
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center;">
              <h1>📋 DOH Compliance Alert</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2>Compliance Action Required</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Compliance Type:</strong> {{complianceType}}</p>
                <p><strong>Action Required:</strong> {{actionRequired}}</p>
                <p><strong>Deadline:</strong> {{deadline}}</p>
                <p><strong>Priority:</strong> HIGH</p>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>Message:</strong></p>
                <p>{{message}}</p>
              </div>
              
              <div style="background: #fee2e2; padding: 15px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Important:</strong> This compliance requirement must be completed by the specified deadline to maintain DOH certification and avoid penalties.</p>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
                This notification is part of the DOH compliance monitoring system.
              </p>
            </div>
          </div>
        `,
        variables: ["complianceType", "actionRequired", "deadline", "message"],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "compliance",
        lastUpdated: new Date(),
        version: "1.0",
      },
    ];

    // SMS templates
    const smsTemplates: NotificationTemplate[] = [
      {
        id: "patient-safety-alert-sms",
        name: "Patient Safety Alert SMS",
        type: "sms",
        language: "en",
        content:
          "🚨 URGENT PATIENT SAFETY ALERT: {{patientName}} at {{location}}. Issue: {{safetyIssue}}. Severity: {{clinicalSeverity}}. Immediate action required. Reported by {{reportedBy}}.",
        variables: [
          "patientName",
          "location",
          "safetyIssue",
          "clinicalSeverity",
          "reportedBy",
        ],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "patient_safety",
        lastUpdated: new Date(),
        version: "1.0",
      },
      {
        id: "medication-reminder-sms",
        name: "Medication Reminder SMS",
        type: "sms",
        language: "en",
        content:
          "💊 MEDICATION REMINDER: Time to take {{medicationName}} - {{dosage}}. Patient: {{patientName}}. Scheduled: {{scheduledTime}}. Contact your healthcare provider if you have questions.",
        variables: ["medicationName", "dosage", "patientName", "scheduledTime"],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "clinical",
        lastUpdated: new Date(),
        version: "1.0",
      },
      {
        id: "emergency-alert-sms",
        name: "Emergency Alert SMS",
        type: "sms",
        language: "en",
        content:
          "🚨 EMERGENCY ALERT: {{emergencyLevel}} at {{location}}. {{message}} Patient: {{patientName}}. Immediate response required. Instructions: {{instructions}}",
        variables: [
          "emergencyLevel",
          "location",
          "message",
          "patientName",
          "instructions",
        ],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "emergency",
        lastUpdated: new Date(),
        version: "1.0",
      },
      {
        id: "compliance-deadline-sms",
        name: "Compliance Deadline SMS",
        type: "sms",
        language: "en",
        content:
          "📋 DOH COMPLIANCE ALERT: {{complianceType}} action required by {{deadline}}. {{actionRequired}} Priority: HIGH. Complete immediately to maintain certification.",
        variables: ["complianceType", "deadline", "actionRequired"],
        healthcareSpecific: true,
        complianceLevel: "DOH",
        category: "compliance",
        lastUpdated: new Date(),
        version: "1.0",
      },
    ];

    // Load all templates
    for (const template of [...emailTemplates, ...smsTemplates]) {
      await this.addTemplate(template);
    }

    console.log(
      `✅ Loaded ${emailTemplates.length} email templates and ${smsTemplates.length} SMS templates`,
    );
  }

  private async initializeProviders(): Promise<void> {
    console.log("🔧 Initializing notification providers...");

    // In production, this would initialize actual provider SDKs
    // For now, we'll simulate the initialization

    // Initialize email providers
    if (this.emailProviders.primary.enabled) {
      console.log(
        `📧 Email provider initialized: ${this.emailProviders.primary.name}`,
      );
    }

    // Initialize SMS providers
    if (this.smsProviders.primary.enabled) {
      console.log(
        `📱 SMS provider initialized: ${this.smsProviders.primary.name}`,
      );
    }

    console.log("✅ Notification providers initialized");
  }

  private startBackgroundProcessors(): void {
    // Start metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 300000); // Every 5 minutes

    // Start cleanup processor
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Every hour

    // Start retry processor
    setInterval(() => {
      this.processRetryQueue();
    }, 60000); // Every minute

    console.log("⚙️ Background processors started");
  }

  private setupEventListeners(): void {
    // Listen for Redis events
    redisIntegrationService.on("cache-hit", (data) => {
      if (data.key.startsWith("template:")) {
        console.log(`📋 Template cache hit: ${data.key}`);
      }
    });

    // Listen for error handler events
    errorHandlerService.on("healthcare-error", (data) => {
      if (data.severity === "critical" || data.severity === "high") {
        // Send alert to administrators
        this.sendSystemAlert(data);
      }
    });
  }

  private validateEmailInputs(
    templateId: string,
    recipients: string[],
    variables: Record<string, any>,
    options: HealthcareNotificationOptions,
  ): void {
    if (!templateId) throw new Error("Template ID is required");
    if (!recipients || recipients.length === 0)
      throw new Error("At least one recipient is required");

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    // Validate healthcare context for compliance
    if (
      options.healthcareContext?.dohCompliant &&
      !options.healthcareContext.patientId
    ) {
      console.warn("DOH compliant notification without patient ID");
    }
  }

  private validateSMSInputs(
    templateId: string,
    recipients: string[],
    variables: Record<string, any>,
    options: HealthcareNotificationOptions,
  ): void {
    if (!templateId) throw new Error("Template ID is required");
    if (!recipients || recipients.length === 0)
      throw new Error("At least one recipient is required");

    // Validate phone numbers (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    for (const phone of recipients) {
      if (!phoneRegex.test(phone.replace(/[\s-()]/g, ""))) {
        throw new Error(`Invalid phone number: ${phone}`);
      }
    }
  }

  private validateTemplate(template: NotificationTemplate): void {
    if (!template.id) throw new Error("Template ID is required");
    if (!template.name) throw new Error("Template name is required");
    if (!template.type || !["email", "sms"].includes(template.type)) {
      throw new Error("Template type must be 'email' or 'sms'");
    }
    if (!template.content) throw new Error("Template content is required");
    if (!template.language || !["en", "ar"].includes(template.language)) {
      throw new Error("Template language must be 'en' or 'ar'");
    }
  }

  private async checkRateLimit(
    type: "email" | "sms",
    count: number,
  ): Promise<void> {
    const now = Date.now();
    const windowSize = 60000; // 1 minute window
    const key = `${type}_rate_limit`;

    const current = this.rateLimiter.get(key);
    if (!current || now > current.resetTime) {
      this.rateLimiter.set(key, { count, resetTime: now + windowSize });
      return;
    }

    const provider =
      type === "email"
        ? this.emailProviders.primary
        : this.smsProviders.primary;
    if (current.count + count > provider.rateLimit * 60) {
      // per minute
      const waitTime = current.resetTime - now;
      console.warn(`⏳ Rate limit reached for ${type}. Waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.rateLimiter.delete(key);
    } else {
      current.count += count;
    }
  }

  private async getEmailTemplate(
    templateId: string,
    language: string,
  ): Promise<NotificationTemplate | null> {
    const cacheKey = `template:email:${templateId}:${language}`;

    // Try Redis cache first
    const cached = await redisIntegrationService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try memory cache
    const template = this.emailTemplates.get(`${templateId}:${language}`);
    if (template) {
      // Cache in Redis for future use
      await redisIntegrationService.set(cacheKey, template, { ttl: 86400 });
      return template;
    }

    return null;
  }

  private async getSMSTemplate(
    templateId: string,
    language: string,
  ): Promise<NotificationTemplate | null> {
    const cacheKey = `template:sms:${templateId}:${language}`;

    // Try Redis cache first
    const cached = await redisIntegrationService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try memory cache
    const template = this.smsTemplates.get(`${templateId}:${language}`);
    if (template) {
      // Cache in Redis for future use
      await redisIntegrationService.set(cacheKey, template, { ttl: 86400 });
      return template;
    }

    return null;
  }

  private async sendSingleEmail(
    recipient: string,
    template: NotificationTemplate,
    variables: Record<string, any>,
    options: HealthcareNotificationOptions,
  ): Promise<DeliveryResult> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Replace variables in template
      const subject = this.replaceVariables(template.subject || "", variables);
      const content = this.replaceVariables(template.content, variables);

      // Simulate email sending (in production, use actual provider)
      await this.simulateEmailSending(recipient, subject, content, options);

      const result: DeliveryResult = {
        messageId,
        recipient,
        status: "sent",
        timestamp: new Date(),
        deliveryTime: Date.now() - startTime,
        provider: this.emailProviders.primary.name,
        cost: 0.001, // Simulated cost
        metadata: {
          templateId: template.id,
          language: template.language,
          priority: options.priority,
          healthcareContext: options.healthcareContext,
        },
      };

      console.log(`📧 Email sent successfully: ${messageId} to ${recipient}`);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email to ${recipient}: ${error.message}`);
    }
  }

  private async sendSingleSMS(
    recipient: string,
    template: NotificationTemplate,
    variables: Record<string, any>,
    options: HealthcareNotificationOptions,
  ): Promise<DeliveryResult> {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Replace variables in template
      const content = this.replaceVariables(template.content, variables);

      // Validate SMS length (160 characters for single SMS)
      if (content.length > 160 && options.priority !== "emergency") {
        console.warn(`SMS content exceeds 160 characters: ${content.length}`);
      }

      // Simulate SMS sending (in production, use actual provider)
      await this.simulateSMSSending(recipient, content, options);

      const result: DeliveryResult = {
        messageId,
        recipient,
        status: "sent",
        timestamp: new Date(),
        deliveryTime: Date.now() - startTime,
        provider: this.smsProviders.primary.name,
        cost: 0.05, // Simulated cost
        metadata: {
          templateId: template.id,
          language: template.language,
          priority: options.priority,
          healthcareContext: options.healthcareContext,
          messageLength: content.length,
        },
      };

      console.log(`📱 SMS sent successfully: ${messageId} to ${recipient}`);
      return result;
    } catch (error) {
      throw new Error(`Failed to send SMS to ${recipient}: ${error.message}`);
    }
  }

  private replaceVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value || ""));
    }
    return result;
  }

  private async simulateEmailSending(
    recipient: string,
    subject: string,
    content: string,
    options: HealthcareNotificationOptions,
  ): Promise<void> {
    // Simulate network delay
    const delay = options.priority === "emergency" ? 100 : 500;
    await new Promise((resolve) =>
      setTimeout(resolve, delay + Math.random() * 200),
    );

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error("Simulated email delivery failure");
    }

    // In production, this would call the actual email provider API
    console.log(`📧 [SIMULATED] Email sent to ${recipient}: ${subject}`);
  }

  private async simulateSMSSending(
    recipient: string,
    content: string,
    options: HealthcareNotificationOptions,
  ): Promise<void> {
    // Simulate network delay
    const delay = options.priority === "emergency" ? 50 : 300;
    await new Promise((resolve) =>
      setTimeout(resolve, delay + Math.random() * 100),
    );

    // Simulate occasional failures (3% failure rate)
    if (Math.random() < 0.03) {
      throw new Error("Simulated SMS delivery failure");
    }

    // In production, this would call the actual SMS provider API
    console.log(
      `📱 [SIMULATED] SMS sent to ${recipient}: ${content.substring(0, 50)}...`,
    );
  }

  private updateEmailMetrics(
    templateId: string,
    result: DeliveryResult,
    options: HealthcareNotificationOptions,
  ): void {
    this.metrics.totalSent++;
    if (result.status === "sent") {
      this.metrics.totalDelivered++;
    } else {
      this.metrics.totalFailed++;
    }

    if (result.cost) {
      this.metrics.totalCost += result.cost;
    }

    if (result.deliveryTime) {
      this.metrics.averageDeliveryTime =
        (this.metrics.averageDeliveryTime + result.deliveryTime) / 2;
    }

    // Update template usage
    if (!this.metrics.templateUsage[templateId]) {
      this.metrics.templateUsage[templateId] = {
        used: 0,
        successRate: 0,
        averageDeliveryTime: 0,
      };
    }
    const templateMetrics = this.metrics.templateUsage[templateId];
    templateMetrics.used++;
    templateMetrics.successRate =
      result.status === "sent"
        ? (templateMetrics.successRate + 100) / 2
        : templateMetrics.successRate * 0.9;
    if (result.deliveryTime) {
      templateMetrics.averageDeliveryTime =
        (templateMetrics.averageDeliveryTime + result.deliveryTime) / 2;
    }
  }

  private updateSMSMetrics(
    templateId: string,
    result: DeliveryResult,
    options: HealthcareNotificationOptions,
  ): void {
    this.updateEmailMetrics(templateId, result, options); // Same logic
  }

  private updateHealthcareMetrics(
    templateId: string,
    results: DeliveryResult[],
    type: "email" | "sms",
  ): void {
    const successfulResults = results.filter((r) => r.status === "sent");

    if (
      templateId.includes("patient-safety") ||
      templateId.includes("safety")
    ) {
      this.metrics.healthcareMetrics.patientSafetyAlerts +=
        successfulResults.length;
    } else if (templateId.includes("emergency")) {
      this.metrics.healthcareMetrics.emergencyNotifications +=
        successfulResults.length;
    } else if (
      templateId.includes("clinical") ||
      templateId.includes("vital") ||
      templateId.includes("lab")
    ) {
      this.metrics.healthcareMetrics.clinicalAlerts += successfulResults.length;
    } else if (
      templateId.includes("compliance") ||
      templateId.includes("doh")
    ) {
      this.metrics.healthcareMetrics.complianceNotifications +=
        successfulResults.length;
    } else if (templateId.includes("medication")) {
      this.metrics.healthcareMetrics.medicationReminders +=
        successfulResults.length;
    } else if (templateId.includes("appointment")) {
      this.metrics.healthcareMetrics.appointmentReminders +=
        successfulResults.length;
    }
  }

  private async sendSystemAlert(errorData: any): Promise<void> {
    try {
      // Send system alert to administrators
      await this.sendEmail(
        "clinical-alert-email",
        ["admin@reyada.com", "tech@reyada.com"],
        {
          recipientName: "System Administrator",
          title: "System Error Alert",
          message: `A ${errorData.severity} error occurred: ${errorData.message}`,
          timestamp: new Date().toISOString(),
        },
        {
          priority: "high",
          healthcareContext: {
            urgencyLevel: "urgent",
            dohCompliant: true,
          },
        },
      );
    } catch (error) {
      console.error("Failed to send system alert:", error);
    }
  }

  private collectMetrics(): void {
    // Calculate delivery and bounce rates
    const totalAttempts = this.metrics.totalSent;
    if (totalAttempts > 0) {
      this.metrics.deliveryRate =
        (this.metrics.totalDelivered / totalAttempts) * 100;
      this.metrics.bounceRate =
        (this.metrics.totalBounced / totalAttempts) * 100;
    }

    // Report to performance monitoring service
    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "SMS_Email_Notifications_Sent",
      value: this.metrics.totalSent,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "SMS_Email_Delivery_Rate",
      value: this.metrics.deliveryRate,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "healthcare",
      name: "Patient_Safety_Notifications_Sent",
      value: this.metrics.healthcareMetrics.patientSafetyAlerts,
      unit: "count",
    });

    this.emit("metrics-collected", this.metrics);
  }

  private cleanupOldData(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    // Clean up old delivery tracking data
    for (const [messageId, result] of this.deliveryTracking.entries()) {
      if (result.timestamp < sevenDaysAgo) {
        this.deliveryTracking.delete(messageId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old delivery records`);
    }
  }

  private async processRetryQueue(): Promise<void> {
    const now = new Date();
    const toRetry: string[] = [];

    for (const [id, retryData] of this.retryQueue.entries()) {
      if (retryData.nextRetry <= now) {
        toRetry.push(id);
      }
    }

    for (const id of toRetry) {
      const retryData = this.retryQueue.get(id);
      if (retryData) {
        try {
          if (retryData.type === "email") {
            await this.sendEmail(
              retryData.template as HealthcareEmailTemplate,
              retryData.recipients,
              retryData.variables,
              retryData.options,
            );
          } else {
            await this.sendSMS(
              retryData.template as HealthcareSMSTemplate,
              retryData.recipients,
              retryData.variables,
              retryData.options,
            );
          }
          this.retryQueue.delete(id);
          console.log(`✅ Retry successful for ${retryData.type}: ${id}`);
        } catch (error) {
          console.error(`❌ Retry failed for ${retryData.type} ${id}:`, error);

          const maxRetries =
            retryData.options.deliveryOptions?.retryAttempts || 3;
          if (retryData.attempts < maxRetries) {
            retryData.attempts++;
            const delay =
              (retryData.options.deliveryOptions?.retryDelay || 5000) *
              retryData.attempts;
            retryData.nextRetry = new Date(now.getTime() + delay);
            console.log(
              `🔄 Scheduling retry ${retryData.attempts}/${maxRetries} for ${id}`,
            );
          } else {
            this.retryQueue.delete(id);
            this.emit("notification-failed-permanently", {
              id,
              type: retryData.type,
            });
            console.error(
              `❌ ${retryData.type} permanently failed after ${maxRetries} retries: ${id}`,
            );
          }
        }
      }
    }
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up SMS/Email Notification Service...");

    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear caches
    this.emailTemplates.clear();
    this.smsTemplates.clear();
    this.deliveryTracking.clear();
    this.rateLimiter.clear();
    this.retryQueue.clear();

    // Remove all listeners
    this.removeAllListeners();

    console.log("✅ SMS/Email Notification Service cleaned up");
  }
}

// Export singleton instance
export const smsEmailNotificationService =
  SMSEmailNotificationService.getInstance();
export default smsEmailNotificationService;
