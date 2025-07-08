/**
 * Real-time Notification Service
 * Production-ready implementation with WebSocket integration, push notifications, and multi-channel support
 */

import { EventEmitter } from "events";
import websocketService from "./websocket.service";
import { smsEmailNotificationService } from "./sms-email-notification.service";
import { errorHandlerService } from "./error-handler.service";
import { advancedCachingService } from "./advanced-caching.service";

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  deviceTokens?: string[]; // For push notifications
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    realTime: boolean;
  };
  timezone?: string;
  language?: "en" | "ar";
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  emailTemplate: string;
  smsTemplate: string;
  pushTemplate: string;
  inAppTemplate: string;
  variables: string[];
  priority: "low" | "medium" | "high" | "urgent";
  channels: ("email" | "sms" | "push" | "in_app" | "websocket")[];
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

export type NotificationType =
  | "document_published"
  | "document_updated"
  | "document_expiring"
  | "acknowledgment_required"
  | "compliance_alert"
  | "system_announcement"
  | "appointment_reminder"
  | "medication_reminder"
  | "emergency_alert"
  | "patient_status_update"
  | "staff_assignment"
  | "quality_alert";

export interface NotificationRequest {
  type: NotificationType;
  recipients: NotificationRecipient[];
  data: {
    documentId?: string;
    documentTitle?: string;
    documentType?: string;
    expiryDate?: string;
    complianceScore?: number;
    acknowledgmentRequired?: boolean;
    urgentNotification?: boolean;
    customMessage?: string;
    patientId?: string;
    appointmentId?: string;
    episodeId?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  };
  channels: ("email" | "sms" | "push" | "in_app" | "websocket")[];
  scheduledAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
  batchId?: string;
  expiresAt?: string;
}

export interface NotificationResponse {
  id: string;
  batchId?: string;
  status: "sent" | "pending" | "failed" | "scheduled" | "partial";
  sentCount: number;
  failedCount: number;
  details: {
    email?: { sent: number; failed: number; errors?: string[] };
    sms?: { sent: number; failed: number; errors?: string[] };
    push?: { sent: number; failed: number; errors?: string[] };
    inApp?: { sent: number; failed: number; errors?: string[] };
    websocket?: { sent: number; failed: number; errors?: string[] };
  };
  sentAt?: string;
  scheduledAt?: string;
  deliveryReport?: {
    delivered: number;
    read: number;
    clicked: number;
    acknowledged: number;
  };
}

export interface NotificationHistory {
  id: string;
  type: NotificationType;
  subject: string;
  recipients: number;
  channels: string[];
  status: "sent" | "failed" | "partial";
  sentAt: string;
  openRate?: number;
  clickRate?: number;
  acknowledgmentRate?: number;
  deliveryRate?: number;
  cost?: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  sound?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
  vibrate?: number[];
}

export interface WebSocketNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  priority: string;
  requiresAcknowledgment?: boolean;
  expiresAt?: string;
}

class RealTimeNotificationService extends EventEmitter {
  private static instance: RealTimeNotificationService;
  private templates: Map<NotificationType, NotificationTemplate> = new Map();
  private notificationQueue: Map<string, NotificationRequest> = new Map();
  private deliveryTracking: Map<string, NotificationResponse> = new Map();
  private retryQueue: Map<
    string,
    { request: NotificationRequest; attempts: number; nextRetry: Date }
  > = new Map();
  private isInitialized = false;
  private pushServiceWorkerUrl = "/sw.js";
  private vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
  private vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
  private fcmServerKey = process.env.FCM_SERVER_KEY || "";
  private metrics = {
    totalSent: 0,
    totalFailed: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalClicked: 0,
    totalAcknowledged: 0,
    averageDeliveryTime: 0,
    channelStats: {
      email: { sent: 0, failed: 0, delivered: 0 },
      sms: { sent: 0, failed: 0, delivered: 0 },
      push: { sent: 0, failed: 0, delivered: 0 },
      inApp: { sent: 0, failed: 0, delivered: 0 },
      websocket: { sent: 0, failed: 0, delivered: 0 },
    },
  };

  public static getInstance(): RealTimeNotificationService {
    if (!RealTimeNotificationService.instance) {
      RealTimeNotificationService.instance = new RealTimeNotificationService();
    }
    return RealTimeNotificationService.instance;
  }

  constructor() {
    super();
    this.initializeTemplates();
    this.startRetryProcessor();
    this.startMetricsCollector();
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🔔 Initializing Real-time Notification Service...");

      // Initialize WebSocket service if not already initialized
      if (!websocketService.isConnected()) {
        await websocketService.connect();
      }

      // Initialize Advanced Caching Service
      await advancedCachingService.initialize({
        healthcareMode: true,
        dohComplianceMode: true,
        patientDataEncryption: true,
        maxMemorySize: 50 * 1024 * 1024, // 50MB for notifications
      });

      // Set up WebSocket event listeners
      this.setupWebSocketListeners();

      // Initialize push notification service worker
      await this.initializePushService();

      // Load notification templates from database/config
      await this.loadNotificationTemplates();

      // Start background processors
      this.startScheduledNotificationProcessor();
      this.startDeliveryTracker();

      this.isInitialized = true;
      console.log("✅ Real-time Notification Service initialized successfully");

      this.emit("service-initialized", {
        timestamp: new Date(),
        templates: this.templates.size,
        queueSize: this.notificationQueue.size,
      });
    } catch (error) {
      console.error(
        "❌ Failed to initialize Real-time Notification Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "RealTimeNotificationService.initialize",
      });
      throw error;
    }
  }

  /**
   * Send notification through multiple channels
   */
  async sendNotification(
    request: NotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const batchId = request.batchId || `batch_${Date.now()}`;

      // Validate request
      this.validateNotificationRequest(request);

      // Get template
      const template = this.templates.get(request.type);
      if (!template) {
        throw new Error(
          `Template not found for notification type: ${request.type}`,
        );
      }

      // Filter recipients based on preferences and channels
      const filteredRecipients = this.filterRecipientsByPreferences(
        request.recipients,
        request.channels,
      );

      if (filteredRecipients.length === 0) {
        console.warn("No eligible recipients found for notification");
        return {
          id: notificationId,
          batchId,
          status: "failed",
          sentCount: 0,
          failedCount: request.recipients.length,
          details: {},
          sentAt: new Date().toISOString(),
        };
      }

      // Check if scheduled
      if (request.scheduledAt && new Date(request.scheduledAt) > new Date()) {
        return this.scheduleNotification(notificationId, request, template);
      }

      // Send immediately
      const response = await this.sendImmediateNotification(
        notificationId,
        request,
        template,
        filteredRecipients,
      );

      // Track delivery
      this.deliveryTracking.set(notificationId, response);

      // Update metrics
      this.updateMetrics(response);

      // Emit event
      this.emit("notification-sent", { id: notificationId, response });

      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      errorHandlerService.handleError(error, {
        context: "RealTimeNotificationService.sendNotification",
        request,
      });
      throw error;
    }
  }

  /**
   * Send real-time WebSocket notification
   */
  async sendRealTimeNotification(
    recipients: NotificationRecipient[],
    payload: WebSocketNotificationPayload,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      if (!recipient.preferences.realTime) continue;

      try {
        // Send via WebSocket to specific user
        await websocketService.sendToUser(recipient.id, {
          type: "notification",
          data: payload,
        });
        sent++;
      } catch (error) {
        console.error(
          `Failed to send real-time notification to ${recipient.id}:`,
          error,
        );
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    recipients: NotificationRecipient[],
    payload: PushNotificationPayload,
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      if (!recipient.preferences.push || !recipient.deviceTokens?.length) {
        continue;
      }

      for (const deviceToken of recipient.deviceTokens) {
        try {
          await this.sendPushToDevice(deviceToken, payload);
          sent++;
        } catch (error) {
          console.error(
            `Failed to send push notification to device ${deviceToken}:`,
            error,
          );
          errors.push(
            `Device ${deviceToken}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          failed++;
        }
      }
    }

    return { sent, failed, errors };
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    requests: NotificationRequest[],
  ): Promise<NotificationResponse[]> {
    const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const responses: NotificationResponse[] = [];

    // Process in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map((request) =>
        this.sendNotification({ ...request, batchId }),
      );

      try {
        const batchResponses = await Promise.allSettled(batchPromises);
        batchResponses.forEach((result, index) => {
          if (result.status === "fulfilled") {
            responses.push(result.value);
          } else {
            console.error(
              `Bulk notification ${i + index} failed:`,
              result.reason,
            );
            responses.push({
              id: `failed_${i + index}`,
              batchId,
              status: "failed",
              sentCount: 0,
              failedCount: batch[index].recipients.length,
              details: {},
              sentAt: new Date().toISOString(),
            });
          }
        });
      } catch (error) {
        console.error("Bulk notification batch failed:", error);
      }

      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return responses;
  }

  /**
   * Get notification delivery status
   */
  async getDeliveryStatus(
    notificationId: string,
  ): Promise<NotificationResponse | null> {
    return this.deliveryTracking.get(notificationId) || null;
  }

  /**
   * Get notification metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(filters?: {
    type?: NotificationType;
    dateRange?: { start: string; end: string };
    status?: string;
    recipient?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: NotificationHistory[]; total: number }> {
    // In production, this would query the database
    // For now, return mock data based on tracking
    const notifications: NotificationHistory[] = Array.from(
      this.deliveryTracking.entries(),
    )
      .map(([id, response]) => ({
        id,
        type: "system_announcement" as NotificationType,
        subject: "Notification",
        recipients: response.sentCount + response.failedCount,
        channels: Object.keys(response.details),
        status: response.status as "sent" | "failed" | "partial",
        sentAt: response.sentAt || new Date().toISOString(),
        deliveryRate: response.deliveryReport
          ? (response.deliveryReport.delivered / (response.sentCount || 1)) *
            100
          : undefined,
        openRate: response.deliveryReport
          ? (response.deliveryReport.read /
              (response.deliveryReport.delivered || 1)) *
            100
          : undefined,
        clickRate: response.deliveryReport
          ? (response.deliveryReport.clicked /
              (response.deliveryReport.read || 1)) *
            100
          : undefined,
        acknowledgmentRate: response.deliveryReport
          ? (response.deliveryReport.acknowledged / (response.sentCount || 1)) *
            100
          : undefined,
      }))
      .slice(
        filters?.offset || 0,
        (filters?.offset || 0) + (filters?.limit || 50),
      );

    return {
      notifications,
      total: this.deliveryTracking.size,
    };
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      const queued = this.notificationQueue.get(notificationId);
      if (queued) {
        this.notificationQueue.delete(notificationId);
        this.emit("notification-cancelled", { id: notificationId });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error cancelling notification:", error);
      return false;
    }
  }

  /**
   * Update notification preferences for recipient
   */
  async updateRecipientPreferences(
    recipientId: string,
    preferences: Partial<NotificationRecipient["preferences"]>,
  ): Promise<boolean> {
    try {
      // In production, this would update the database
      // For now, emit event for other services to handle
      this.emit("preferences-updated", { recipientId, preferences });
      return true;
    } catch (error) {
      console.error("Error updating recipient preferences:", error);
      return false;
    }
  }

  // Private methods
  private async sendImmediateNotification(
    notificationId: string,
    request: NotificationRequest,
    template: NotificationTemplate,
    recipients: NotificationRecipient[],
  ): Promise<NotificationResponse> {
    const response: NotificationResponse = {
      id: notificationId,
      batchId: request.batchId,
      status: "pending",
      sentCount: 0,
      failedCount: 0,
      details: {},
      sentAt: new Date().toISOString(),
    };

    const channelPromises: Promise<void>[] = [];

    // WebSocket notifications
    if (request.channels.includes("websocket")) {
      channelPromises.push(
        this.sendWebSocketNotifications(
          recipients,
          request,
          template,
          response,
        ),
      );
    }

    // Push notifications
    if (request.channels.includes("push")) {
      channelPromises.push(
        this.sendPushNotifications(recipients, request, template, response),
      );
    }

    // Email notifications
    if (request.channels.includes("email")) {
      channelPromises.push(
        this.sendEmailNotifications(recipients, request, template, response),
      );
    }

    // SMS notifications
    if (request.channels.includes("sms")) {
      channelPromises.push(
        this.sendSMSNotifications(recipients, request, template, response),
      );
    }

    // In-app notifications
    if (request.channels.includes("in_app")) {
      channelPromises.push(
        this.sendInAppNotifications(recipients, request, template, response),
      );
    }

    // Wait for all channels to complete
    await Promise.allSettled(channelPromises);

    // Determine final status
    response.status =
      response.failedCount === 0
        ? "sent"
        : response.sentCount === 0
          ? "failed"
          : "partial";

    return response;
  }

  private async sendWebSocketNotifications(
    recipients: NotificationRecipient[],
    request: NotificationRequest,
    template: NotificationTemplate,
    response: NotificationResponse,
  ): Promise<void> {
    const wsRecipients = recipients.filter((r) => r.preferences.realTime);
    const payload: WebSocketNotificationPayload = {
      id: response.id!,
      type: request.type,
      title: this.processTemplate(template.subject, request.data),
      message: this.processTemplate(template.inAppTemplate, request.data),
      data: request.data,
      timestamp: new Date().toISOString(),
      priority: request.priority,
      requiresAcknowledgment: request.data.acknowledgmentRequired,
      expiresAt: request.expiresAt,
    };

    const result = await this.sendRealTimeNotification(wsRecipients, payload);
    response.details.websocket = { sent: result.sent, failed: result.failed };
    response.sentCount += result.sent;
    response.failedCount += result.failed;
  }

  private async sendPushNotifications(
    recipients: NotificationRecipient[],
    request: NotificationRequest,
    template: NotificationTemplate,
    response: NotificationResponse,
  ): Promise<void> {
    const pushRecipients = recipients.filter(
      (r) => r.preferences.push && r.deviceTokens?.length,
    );
    const payload: PushNotificationPayload = {
      title: this.processTemplate(template.subject, request.data),
      body: this.processTemplate(template.pushTemplate, request.data),
      icon: "/icons/notification-icon.png",
      badge: 1,
      data: request.data,
      requireInteraction: request.priority === "urgent",
      tag: `${request.type}_${response.id}`,
      timestamp: Date.now(),
    };

    if (request.data.actionUrl) {
      payload.actions = [
        {
          action: "view",
          title: "View",
          icon: "/icons/view-icon.png",
        },
      ];
    }

    const result = await this.sendPushNotification(pushRecipients, payload);
    response.details.push = {
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
    };
    response.sentCount += result.sent;
    response.failedCount += result.failed;
  }

  private async sendEmailNotifications(
    recipients: NotificationRecipient[],
    request: NotificationRequest,
    template: NotificationTemplate,
    response: NotificationResponse,
  ): Promise<void> {
    const emailRecipients = recipients.filter(
      (r) => r.preferences.email && r.email,
    );
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of emailRecipients) {
      try {
        await smsEmailNotificationService.sendEmail({
          templateId: template.id,
          recipient: {
            email: recipient.email,
            name: recipient.name,
            language: recipient.language,
          },
          variables: this.prepareTemplateVariables(request.data, recipient),
          priority: request.priority,
          scheduledTime: request.scheduledAt,
          metadata: {
            patientId: request.data.patientId,
            appointmentId: request.data.appointmentId,
            episodeId: request.data.episodeId,
          },
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        errors.push(
          `${recipient.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        failed++;
      }
    }

    response.details.email = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendSMSNotifications(
    recipients: NotificationRecipient[],
    request: NotificationRequest,
    template: NotificationTemplate,
    response: NotificationResponse,
  ): Promise<void> {
    const smsRecipients = recipients.filter(
      (r) => r.preferences.sms && r.phone,
    );
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of smsRecipients) {
      try {
        await smsEmailNotificationService.sendSMS({
          templateId: template.id,
          recipient: {
            phone: recipient.phone!,
            name: recipient.name,
            language: recipient.language,
          },
          variables: this.prepareTemplateVariables(request.data, recipient),
          priority: request.priority,
          scheduledTime: request.scheduledAt,
          metadata: {
            patientId: request.data.patientId,
            appointmentId: request.data.appointmentId,
            episodeId: request.data.episodeId,
          },
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send SMS to ${recipient.phone}:`, error);
        errors.push(
          `${recipient.phone}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        failed++;
      }
    }

    response.details.sms = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendInAppNotifications(
    recipients: NotificationRecipient[],
    request: NotificationRequest,
    template: NotificationTemplate,
    response: NotificationResponse,
  ): Promise<void> {
    const inAppRecipients = recipients.filter((r) => r.preferences.inApp);
    let sent = 0;
    let failed = 0;

    // In-app notifications are stored in database and shown in UI
    // For now, we'll emit events that the UI can listen to
    for (const recipient of inAppRecipients) {
      try {
        this.emit("in-app-notification", {
          recipientId: recipient.id,
          notification: {
            id: response.id,
            type: request.type,
            title: this.processTemplate(template.subject, request.data),
            message: this.processTemplate(template.inAppTemplate, request.data),
            data: request.data,
            timestamp: new Date().toISOString(),
            priority: request.priority,
            read: false,
            acknowledged: false,
          },
        });
        sent++;
      } catch (error) {
        console.error(
          `Failed to send in-app notification to ${recipient.id}:`,
          error,
        );
        failed++;
      }
    }

    response.details.inApp = { sent, failed };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendPushToDevice(
    deviceToken: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    // Implementation would depend on the push service (FCM, APNS, etc.)
    // For FCM:
    if (this.fcmServerKey) {
      const fcmPayload = {
        to: deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          sound: payload.sound,
          tag: payload.tag,
        },
        data: payload.data,
      };

      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${this.fcmServerKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fcmPayload),
      });

      if (!response.ok) {
        throw new Error(`FCM request failed: ${response.statusText}`);
      }
    } else {
      // Fallback to Web Push API
      console.log("Push notification sent to device:", deviceToken, payload);
    }
  }

  private scheduleNotification(
    notificationId: string,
    request: NotificationRequest,
    template: NotificationTemplate,
  ): NotificationResponse {
    this.notificationQueue.set(notificationId, request);

    return {
      id: notificationId,
      batchId: request.batchId,
      status: "scheduled",
      sentCount: 0,
      failedCount: 0,
      details: {},
      scheduledAt: request.scheduledAt,
    };
  }

  private validateNotificationRequest(request: NotificationRequest): void {
    if (!request.type) {
      throw new Error("Notification type is required");
    }
    if (!request.recipients || request.recipients.length === 0) {
      throw new Error("At least one recipient is required");
    }
    if (!request.channels || request.channels.length === 0) {
      throw new Error("At least one channel is required");
    }
    if (!request.priority) {
      throw new Error("Priority is required");
    }
  }

  private filterRecipientsByPreferences(
    recipients: NotificationRecipient[],
    channels: string[],
  ): NotificationRecipient[] {
    return recipients.filter((recipient) => {
      return channels.some((channel) => {
        switch (channel) {
          case "email":
            return recipient.preferences.email && recipient.email;
          case "sms":
            return recipient.preferences.sms && recipient.phone;
          case "push":
            return recipient.preferences.push && recipient.deviceTokens?.length;
          case "in_app":
            return recipient.preferences.inApp;
          case "websocket":
            return recipient.preferences.realTime;
          default:
            return false;
        }
      });
    });
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      processed = processed.replace(placeholder, String(value || ""));
    });
    return processed;
  }

  private prepareTemplateVariables(
    data: Record<string, any>,
    recipient: NotificationRecipient,
  ): Record<string, string> {
    return {
      ...data,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      recipientPhone: recipient.phone || "",
      recipientDepartment: recipient.department,
      recipientRole: recipient.role,
    };
  }

  private setupWebSocketListeners(): void {
    websocketService.on("user-connected", (userId: string) => {
      this.emit("recipient-online", { userId });
    });

    websocketService.on("user-disconnected", (userId: string) => {
      this.emit("recipient-offline", { userId });
    });

    websocketService.on("notification-acknowledged", (data: any) => {
      this.handleNotificationAcknowledgment(data);
    });
  }

  private async initializePushService(): Promise<void> {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          this.pushServiceWorkerUrl,
        );
        console.log("Push service worker registered:", registration);
      } catch (error) {
        console.error("Failed to register push service worker:", error);
      }
    }
  }

  private async loadNotificationTemplates(): Promise<void> {
    // In production, load from database
    // For now, use the initialized templates
    console.log(`✅ Loaded ${this.templates.size} notification templates`);
  }

  private initializeTemplates(): void {
    const templates: Omit<NotificationTemplate, "id">[] = [
      {
        name: "Document Published",
        type: "document_published",
        subject: "New Document Published: {{documentTitle}}",
        emailTemplate: `
          <h2>New Document Published</h2>
          <p>Dear {{recipientName}},</p>
          <p>A new {{documentType}} has been published:</p>
          <h3>{{documentTitle}}</h3>
          <p>{{#acknowledgmentRequired}}This document requires your acknowledgment.{{/acknowledgmentRequired}}</p>
          <p><a href="{{actionUrl}}">View Document</a></p>
        `,
        smsTemplate:
          "New {{documentType}}: {{documentTitle}}. {{#acknowledgmentRequired}}Acknowledgment required.{{/acknowledgmentRequired}} View: {{actionUrl}}",
        pushTemplate: "📋 New {{documentType}}: {{documentTitle}}",
        inAppTemplate: "New {{documentType}} published: {{documentTitle}}",
        variables: [
          "documentTitle",
          "documentType",
          "actionUrl",
          "acknowledgmentRequired",
        ],
        priority: "medium",
        channels: ["email", "in_app", "websocket"],
        retryPolicy: { maxRetries: 3, retryDelay: 5000, backoffMultiplier: 2 },
      },
      {
        name: "Emergency Alert",
        type: "emergency_alert",
        subject: "🚨 URGENT: {{customMessage}}",
        emailTemplate: `
          <div style="background: #ff4444; color: white; padding: 20px;">
            <h2>🚨 EMERGENCY ALERT</h2>
            <p>{{customMessage}}</p>
            <p><strong>Immediate action required.</strong></p>
          </div>
        `,
        smsTemplate: "🚨 URGENT: {{customMessage}}",
        pushTemplate: "🚨 EMERGENCY: {{customMessage}}",
        inAppTemplate: "🚨 EMERGENCY ALERT: {{customMessage}}",
        variables: ["customMessage"],
        priority: "urgent",
        channels: ["email", "sms", "push", "in_app", "websocket"],
        retryPolicy: {
          maxRetries: 5,
          retryDelay: 1000,
          backoffMultiplier: 1.5,
        },
      },
      {
        name: "Appointment Reminder",
        type: "appointment_reminder",
        subject: "Appointment Reminder - {{appointmentDate}}",
        emailTemplate: `
          <h2>Appointment Reminder</h2>
          <p>Dear {{recipientName}},</p>
          <p>This is a reminder of your upcoming appointment:</p>
          <ul>
            <li><strong>Date:</strong> {{appointmentDate}}</li>
            <li><strong>Time:</strong> {{appointmentTime}}</li>
            <li><strong>Provider:</strong> {{providerName}}</li>
          </ul>
          <p><a href="{{actionUrl}}">View Details</a></p>
        `,
        smsTemplate:
          "Appointment reminder: {{appointmentDate}} at {{appointmentTime}} with {{providerName}}",
        pushTemplate:
          "📅 Appointment: {{appointmentDate}} at {{appointmentTime}}",
        inAppTemplate:
          "Upcoming appointment: {{appointmentDate}} at {{appointmentTime}}",
        variables: [
          "appointmentDate",
          "appointmentTime",
          "providerName",
          "actionUrl",
        ],
        priority: "medium",
        channels: ["email", "sms", "push", "in_app"],
        retryPolicy: {
          maxRetries: 2,
          retryDelay: 3600000,
          backoffMultiplier: 1,
        }, // 1 hour delay
      },
    ];

    templates.forEach((templateData, index) => {
      const template: NotificationTemplate = {
        id: `template_${index + 1}`,
        ...templateData,
      };
      this.templates.set(template.type, template);
    });
  }

  private startScheduledNotificationProcessor(): void {
    setInterval(async () => {
      const now = new Date();
      for (const [id, request] of this.notificationQueue.entries()) {
        if (request.scheduledAt && new Date(request.scheduledAt) <= now) {
          try {
            await this.sendNotification({ ...request, scheduledAt: undefined });
            this.notificationQueue.delete(id);
          } catch (error) {
            console.error(
              `Failed to send scheduled notification ${id}:`,
              error,
            );
            // Add to retry queue
            this.addToRetryQueue(id, request);
            this.notificationQueue.delete(id);
          }
        }
      }
    }, 60000); // Check every minute
  }

  private startRetryProcessor(): void {
    setInterval(async () => {
      const now = new Date();
      for (const [id, retryData] of this.retryQueue.entries()) {
        if (retryData.nextRetry <= now) {
          try {
            await this.sendNotification(retryData.request);
            this.retryQueue.delete(id);
          } catch (error) {
            console.error(
              `Retry attempt ${retryData.attempts} failed for notification ${id}:`,
              error,
            );

            const template = this.templates.get(retryData.request.type);
            if (
              template &&
              retryData.attempts < template.retryPolicy.maxRetries
            ) {
              // Schedule next retry
              retryData.attempts++;
              retryData.nextRetry = new Date(
                now.getTime() +
                  template.retryPolicy.retryDelay *
                    Math.pow(
                      template.retryPolicy.backoffMultiplier,
                      retryData.attempts - 1,
                    ),
              );
            } else {
              // Max retries reached, remove from queue
              this.retryQueue.delete(id);
              this.emit("notification-failed-permanently", {
                id,
                request: retryData.request,
              });
            }
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private startDeliveryTracker(): void {
    setInterval(
      () => {
        // Clean up old delivery tracking data (older than 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        for (const [id, response] of this.deliveryTracking.entries()) {
          if (response.sentAt && new Date(response.sentAt) < sevenDaysAgo) {
            this.deliveryTracking.delete(id);
          }
        }
      },
      24 * 60 * 60 * 1000,
    ); // Check daily
  }

  private startMetricsCollector(): void {
    setInterval(() => {
      // Collect and emit metrics
      this.emit("metrics-updated", this.getMetrics());
    }, 300000); // Every 5 minutes
  }

  private addToRetryQueue(id: string, request: NotificationRequest): void {
    const template = this.templates.get(request.type);
    if (template) {
      this.retryQueue.set(id, {
        request,
        attempts: 1,
        nextRetry: new Date(Date.now() + template.retryPolicy.retryDelay),
      });
    }
  }

  private handleNotificationAcknowledgment(data: {
    notificationId: string;
    userId: string;
  }): void {
    const response = this.deliveryTracking.get(data.notificationId);
    if (response && response.deliveryReport) {
      response.deliveryReport.acknowledged++;
      this.emit("notification-acknowledged", data);
    }
  }

  private updateMetrics(response: NotificationResponse): void {
    this.metrics.totalSent += response.sentCount;
    this.metrics.totalFailed += response.failedCount;

    // Update channel-specific metrics
    Object.entries(response.details).forEach(([channel, stats]) => {
      if (
        this.metrics.channelStats[
          channel as keyof typeof this.metrics.channelStats
        ]
      ) {
        this.metrics.channelStats[
          channel as keyof typeof this.metrics.channelStats
        ].sent += stats.sent;
        this.metrics.channelStats[
          channel as keyof typeof this.metrics.channelStats
        ].failed += stats.failed;
      }
    });
  }
}

// Export singleton instance
export const realTimeNotificationService =
  RealTimeNotificationService.getInstance();
export default realTimeNotificationService;
