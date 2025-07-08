/**
 * Comprehensive Real-time Notification Service
 * Production-ready implementation integrating WebSocket, Push, SMS, and Email notifications
 * Phase 1: Service Integration - Real-time Notification Service Implementation
 */

import { EventEmitter } from "events";
import websocketService from "./websocket.service";
import { smsEmailNotificationService } from "./sms-email-notification.service";
import { pushNotificationService } from "./push-notification.service";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

// Healthcare-specific notification types
export type HealthcareNotificationType =
  | "patient_safety_alert"
  | "medication_reminder"
  | "appointment_reminder"
  | "clinical_alert"
  | "emergency_protocol"
  | "doh_compliance_alert"
  | "jawda_quality_alert"
  | "incident_report"
  | "care_plan_update"
  | "vital_signs_alert"
  | "lab_results_alert"
  | "discharge_planning"
  | "infection_control_alert"
  | "quality_metrics_alert"
  | "staff_assignment"
  | "equipment_alert";

export interface HealthcareNotificationRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "patient" | "clinician" | "nurse" | "admin" | "family" | "physician";
  department?: string;
  facilityId?: string;
  deviceTokens?: string[];
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    realTime: boolean;
    inApp: boolean;
    emergencyOnly?: boolean;
  };
  healthcareContext?: {
    patientIds?: string[];
    specialties?: string[];
    shifts?: string[];
    emergencyContact?: boolean;
    dohAuthorized?: boolean;
  };
  timezone?: string;
  language?: "en" | "ar";
}

export interface HealthcareNotificationRequest {
  id?: string;
  type: HealthcareNotificationType;
  title: string;
  message: string;
  recipients: HealthcareNotificationRecipient[];
  channels: ("websocket" | "push" | "email" | "sms" | "inApp")[];
  priority: "low" | "medium" | "high" | "critical" | "emergency";
  data: {
    patientId?: string;
    patientName?: string;
    episodeId?: string;
    appointmentId?: string;
    medicationId?: string;
    facilityId?: string;
    departmentId?: string;
    clinicianId?: string;
    incidentId?: string;
    vitalSignsId?: string;
    labResultId?: string;
    actionUrl?: string;
    acknowledgmentRequired?: boolean;
    expiresAt?: string;
    metadata?: Record<string, any>;
    // DOH Compliance specific
    dohCompliant?: boolean;
    complianceType?: "DOH" | "JAWDA" | "ADHICS" | "TAWTEEN";
    // Emergency specific
    emergencyLevel?: "code_blue" | "code_red" | "code_yellow" | "code_green";
    emergencyLocation?: string;
    // Clinical specific
    clinicalSeverity?: "low" | "moderate" | "high" | "critical";
    vitalSigns?: {
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    };
  };
  scheduledAt?: Date;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  batchId?: string;
}

export interface NotificationResponse {
  id: string;
  batchId?: string;
  status: "sent" | "pending" | "failed" | "scheduled" | "partial";
  sentCount: number;
  failedCount: number;
  channels: {
    websocket?: { sent: number; failed: number; errors?: string[] };
    push?: { sent: number; failed: number; errors?: string[] };
    email?: { sent: number; failed: number; errors?: string[] };
    sms?: { sent: number; failed: number; errors?: string[] };
    inApp?: { sent: number; failed: number; errors?: string[] };
  };
  sentAt?: Date;
  scheduledAt?: Date;
  deliveryReport?: {
    delivered: number;
    read: number;
    acknowledged: number;
  };
  healthcareMetrics?: {
    patientSafetyAlerts: number;
    emergencyNotifications: number;
    clinicalAlerts: number;
    complianceNotifications: number;
  };
}

export interface NotificationMetrics {
  totalSent: number;
  totalFailed: number;
  totalDelivered: number;
  totalAcknowledged: number;
  averageDeliveryTime: number;
  channelPerformance: {
    websocket: { sent: number; failed: number; deliveryRate: number };
    push: { sent: number; failed: number; deliveryRate: number };
    email: { sent: number; failed: number; deliveryRate: number };
    sms: { sent: number; failed: number; deliveryRate: number };
    inApp: { sent: number; failed: number; deliveryRate: number };
  };
  healthcareMetrics: {
    patientSafetyAlerts: number;
    emergencyNotifications: number;
    clinicalAlerts: number;
    medicationReminders: number;
    appointmentReminders: number;
    complianceAlerts: number;
    qualityAlerts: number;
  };
  performanceMetrics: {
    averageProcessingTime: number;
    queueSize: number;
    retryRate: number;
    errorRate: number;
  };
}

class ComprehensiveRealTimeNotificationService extends EventEmitter {
  private static instance: ComprehensiveRealTimeNotificationService;
  private isInitialized = false;
  private notificationQueue: Map<string, HealthcareNotificationRequest> =
    new Map();
  private deliveryTracking: Map<string, NotificationResponse> = new Map();
  private retryQueue: Map<
    string,
    {
      request: HealthcareNotificationRequest;
      attempts: number;
      nextRetry: Date;
    }
  > = new Map();
  private metrics: NotificationMetrics;
  private processingInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  public static getInstance(): ComprehensiveRealTimeNotificationService {
    if (!ComprehensiveRealTimeNotificationService.instance) {
      ComprehensiveRealTimeNotificationService.instance =
        new ComprehensiveRealTimeNotificationService();
    }
    return ComprehensiveRealTimeNotificationService.instance;
  }

  constructor() {
    super();
    this.metrics = {
      totalSent: 0,
      totalFailed: 0,
      totalDelivered: 0,
      totalAcknowledged: 0,
      averageDeliveryTime: 0,
      channelPerformance: {
        websocket: { sent: 0, failed: 0, deliveryRate: 0 },
        push: { sent: 0, failed: 0, deliveryRate: 0 },
        email: { sent: 0, failed: 0, deliveryRate: 0 },
        sms: { sent: 0, failed: 0, deliveryRate: 0 },
        inApp: { sent: 0, failed: 0, deliveryRate: 0 },
      },
      healthcareMetrics: {
        patientSafetyAlerts: 0,
        emergencyNotifications: 0,
        clinicalAlerts: 0,
        medicationReminders: 0,
        appointmentReminders: 0,
        complianceAlerts: 0,
        qualityAlerts: 0,
      },
      performanceMetrics: {
        averageProcessingTime: 0,
        queueSize: 0,
        retryRate: 0,
        errorRate: 0,
      },
    };
  }

  /**
   * Initialize the comprehensive notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(
        "🔔 Initializing Comprehensive Real-time Notification Service...",
      );

      // Initialize all underlying services
      await this.initializeServices();

      // Set up event listeners
      this.setupEventListeners();

      // Start background processors
      this.startProcessors();

      // Initialize healthcare-specific templates
      await this.initializeHealthcareTemplates();

      this.isInitialized = true;
      console.log(
        "✅ Comprehensive Real-time Notification Service initialized successfully",
      );

      this.emit("service-initialized", {
        timestamp: new Date(),
        queueSize: this.notificationQueue.size,
        metrics: this.metrics,
      });
    } catch (error) {
      console.error(
        "❌ Failed to initialize Comprehensive Real-time Notification Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "ComprehensiveRealTimeNotificationService.initialize",
      });
      throw error;
    }
  }

  /**
   * Send healthcare notification through multiple channels
   */
  async sendHealthcareNotification(
    request: HealthcareNotificationRequest,
  ): Promise<NotificationResponse> {
    const startTime = Date.now();
    const notificationId =
      request.id ||
      `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate request
      this.validateNotificationRequest(request);

      // Filter recipients based on preferences and healthcare context
      const filteredRecipients = this.filterHealthcareRecipients(
        request.recipients,
        request,
      );

      if (filteredRecipients.length === 0) {
        console.warn(
          "No eligible healthcare recipients found for notification",
        );
        return this.createFailedResponse(
          notificationId,
          request,
          "No eligible recipients",
        );
      }

      // Check if scheduled
      if (request.scheduledAt && request.scheduledAt > new Date()) {
        return this.scheduleNotification(notificationId, request);
      }

      // Send immediately through all requested channels
      const response = await this.sendMultiChannelNotification(
        notificationId,
        request,
        filteredRecipients,
      );

      // Track delivery
      this.deliveryTracking.set(notificationId, response);

      // Update metrics
      this.updateMetrics(response, Date.now() - startTime);

      // Update healthcare-specific metrics
      this.updateHealthcareMetrics(request, response);

      // Emit events
      this.emit("notification-sent", { id: notificationId, response, request });
      this.emit("healthcare-notification-sent", {
        type: request.type,
        priority: request.priority,
        patientId: request.data.patientId,
        response,
      });

      console.log(
        `📤 Healthcare notification sent: ${request.type} (${response.status}) - ${response.sentCount}/${response.sentCount + response.failedCount} recipients`,
      );

      return response;
    } catch (error) {
      console.error("❌ Failed to send healthcare notification:", error);
      errorHandlerService.handleError(error, {
        context:
          "ComprehensiveRealTimeNotificationService.sendHealthcareNotification",
        notificationId,
        type: request.type,
        priority: request.priority,
      });

      const failedResponse = this.createFailedResponse(
        notificationId,
        request,
        error.message,
      );
      this.updateMetrics(failedResponse, Date.now() - startTime);
      return failedResponse;
    }
  }

  /**
   * Send emergency notification with highest priority
   */
  async sendEmergencyNotification(
    type: HealthcareNotificationType,
    title: string,
    message: string,
    emergencyData: {
      emergencyLevel: "code_blue" | "code_red" | "code_yellow" | "code_green";
      location: string;
      patientId?: string;
      patientName?: string;
      instructions?: string;
    },
    targetRoles: string[] = ["clinician", "nurse", "physician", "admin"],
  ): Promise<NotificationResponse> {
    // Get all emergency contacts for the specified roles
    const emergencyRecipients = await this.getEmergencyContacts(
      targetRoles,
      emergencyData.location,
    );

    const emergencyRequest: HealthcareNotificationRequest = {
      type,
      title: `🚨 EMERGENCY: ${title}`,
      message,
      recipients: emergencyRecipients,
      channels: ["websocket", "push", "sms", "email"], // All channels for emergency
      priority: "emergency",
      data: {
        ...emergencyData,
        emergencyLevel: emergencyData.emergencyLevel,
        emergencyLocation: emergencyData.location,
        acknowledgmentRequired: true,
        dohCompliant: true,
        complianceType: "DOH",
      },
      retryPolicy: {
        maxRetries: 5,
        retryDelay: 1000, // 1 second for emergency
        backoffMultiplier: 1.2,
      },
    };

    return await this.sendHealthcareNotification(emergencyRequest);
  }

  /**
   * Send patient safety alert
   */
  async sendPatientSafetyAlert(
    patientId: string,
    patientName: string,
    safetyIssue: string,
    location: string,
    reportedBy: string,
    severity: "low" | "moderate" | "high" | "critical" = "high",
  ): Promise<NotificationResponse> {
    const recipients = await this.getPatientCareTeam(patientId);

    return await this.sendHealthcareNotification({
      type: "patient_safety_alert",
      title: "Patient Safety Alert",
      message: `Safety issue reported for ${patientName}: ${safetyIssue}`,
      recipients,
      channels: ["websocket", "push", "email"],
      priority: severity === "critical" ? "emergency" : "critical",
      data: {
        patientId,
        patientName,
        safetyIssue,
        location,
        reportedBy,
        clinicalSeverity: severity,
        acknowledgmentRequired: true,
        dohCompliant: true,
        complianceType: "DOH",
      },
    });
  }

  /**
   * Send medication reminder
   */
  async sendMedicationReminder(
    patientId: string,
    patientName: string,
    medicationName: string,
    dosage: string,
    scheduledTime: string,
  ): Promise<NotificationResponse> {
    const recipients = await this.getPatientAndFamily(patientId);

    return await this.sendHealthcareNotification({
      type: "medication_reminder",
      title: "Medication Reminder",
      message: `Time to take ${medicationName} - ${dosage}`,
      recipients,
      channels: ["push", "sms"],
      priority: "high",
      data: {
        patientId,
        patientName,
        medicationName,
        dosage,
        scheduledTime,
        dohCompliant: true,
      },
    });
  }

  /**
   * Send DOH compliance alert
   */
  async sendDOHComplianceAlert(
    complianceType: "DOH" | "JAWDA" | "ADHICS" | "TAWTEEN",
    title: string,
    message: string,
    deadline: string,
    actionRequired: string,
    targetRoles: string[] = ["admin", "clinician"],
  ): Promise<NotificationResponse> {
    const recipients = await this.getComplianceOfficers(targetRoles);

    return await this.sendHealthcareNotification({
      type: "doh_compliance_alert",
      title: `${complianceType} Compliance Alert`,
      message,
      recipients,
      channels: ["websocket", "email", "push"],
      priority: "high",
      data: {
        complianceType,
        deadline,
        actionRequired,
        dohCompliant: true,
        acknowledgmentRequired: true,
      },
    });
  }

  /**
   * Send bulk notifications with batching
   */
  async sendBulkHealthcareNotifications(
    requests: HealthcareNotificationRequest[],
  ): Promise<NotificationResponse[]> {
    const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const responses: NotificationResponse[] = [];
    const batchSize = 25; // Smaller batches for healthcare to ensure reliability

    console.log(
      `📦 Processing bulk healthcare notifications: ${requests.length} requests`,
    );

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map((request) =>
        this.sendHealthcareNotification({ ...request, batchId }),
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            responses.push(result.value);
          } else {
            console.error(
              `Bulk notification ${i + index} failed:`,
              result.reason,
            );
            responses.push(
              this.createFailedResponse(
                `failed_${i + index}`,
                batch[index],
                result.reason?.message || "Unknown error",
              ),
            );
          }
        });
      } catch (error) {
        console.error("Bulk notification batch failed:", error);
      }

      // Add delay between batches to prevent overwhelming
      if (i + batchSize < requests.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    console.log(
      `✅ Bulk healthcare notifications completed: ${responses.length} processed`,
    );
    this.emit("bulk-notifications-completed", {
      batchId,
      total: responses.length,
      responses,
    });

    return responses;
  }

  /**
   * Get notification delivery status
   */
  getDeliveryStatus(notificationId: string): NotificationResponse | null {
    return this.deliveryTracking.get(notificationId) || null;
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
   * Cancel scheduled notification
   */
  cancelNotification(notificationId: string): boolean {
    const queued = this.notificationQueue.get(notificationId);
    if (queued) {
      this.notificationQueue.delete(notificationId);
      this.emit("notification-cancelled", { id: notificationId });
      console.log(`🚫 Notification cancelled: ${notificationId}`);
      return true;
    }
    return false;
  }

  // Private methods
  private async initializeServices(): Promise<void> {
    try {
      // Initialize WebSocket service
      if (!websocketService.isConnected()) {
        console.log("🔌 Connecting WebSocket service...");
        await websocketService.connect();
      }

      // Initialize SMS/Email service
      console.log("📧 Initializing SMS/Email service...");
      await smsEmailNotificationService.initialize();

      // Initialize Push notification service
      console.log("📱 Initializing Push notification service...");
      await pushNotificationService.initialize();

      console.log("✅ All notification services initialized");
    } catch (error) {
      console.error("❌ Failed to initialize notification services:", error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // WebSocket events
    websocketService.on("connected", () => {
      console.log("🔗 WebSocket connected for notifications");
      this.emit("websocket-connected");
    });

    websocketService.on("disconnected", () => {
      console.log("🔌 WebSocket disconnected for notifications");
      this.emit("websocket-disconnected");
    });

    // Healthcare-specific WebSocket events
    websocketService.on("patient-safety-incident", (data: any) => {
      this.handlePatientSafetyIncident(data);
    });

    websocketService.on("emergency-alert", (data: any) => {
      this.handleEmergencyAlert(data);
    });

    websocketService.on("medication-due", (data: any) => {
      this.handleMedicationReminder(data);
    });

    // Push notification events
    pushNotificationService.on("subscription-created", (data: any) => {
      console.log("📱 New push subscription created:", data);
    });

    pushNotificationService.on("notification-sent", (data: any) => {
      this.updateChannelMetrics("push", data.successful, data.failed);
    });

    // SMS/Email events
    this.on("sms-sent", (data: any) => {
      this.updateChannelMetrics("sms", data.sent, data.failed);
    });

    this.on("email-sent", (data: any) => {
      this.updateChannelMetrics("email", data.sent, data.failed);
    });
  }

  private startProcessors(): void {
    // Start scheduled notification processor
    this.processingInterval = setInterval(() => {
      this.processScheduledNotifications();
    }, 30000); // Every 30 seconds

    // Start retry processor
    setInterval(() => {
      this.processRetryQueue();
    }, 60000); // Every minute

    // Start metrics collector
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 300000); // Every 5 minutes

    // Start cleanup processor
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Every hour

    console.log("⚙️ Background processors started");
  }

  private async initializeHealthcareTemplates(): Promise<void> {
    // Initialize healthcare-specific templates in underlying services
    console.log("🏥 Initializing healthcare notification templates...");

    // Templates are already initialized in the individual services
    // This method can be extended to load custom templates from database

    console.log("✅ Healthcare notification templates initialized");
  }

  private validateNotificationRequest(
    request: HealthcareNotificationRequest,
  ): void {
    if (!request.type) throw new Error("Notification type is required");
    if (!request.title) throw new Error("Notification title is required");
    if (!request.message) throw new Error("Notification message is required");
    if (!request.recipients || request.recipients.length === 0) {
      throw new Error("At least one recipient is required");
    }
    if (!request.channels || request.channels.length === 0) {
      throw new Error("At least one channel is required");
    }
    if (!request.priority) throw new Error("Priority is required");
  }

  private filterHealthcareRecipients(
    recipients: HealthcareNotificationRecipient[],
    request: HealthcareNotificationRequest,
  ): HealthcareNotificationRecipient[] {
    return recipients.filter((recipient) => {
      // Check if recipient has preferences for any of the requested channels
      const hasChannelPreference = request.channels.some((channel) => {
        switch (channel) {
          case "email":
            return recipient.preferences.email && recipient.email;
          case "sms":
            return recipient.preferences.sms && recipient.phone;
          case "push":
            return recipient.preferences.push && recipient.deviceTokens?.length;
          case "websocket":
            return recipient.preferences.realTime;
          case "inApp":
            return recipient.preferences.inApp;
          default:
            return false;
        }
      });

      // For emergency notifications, override preferences
      if (
        request.priority === "emergency" &&
        recipient.healthcareContext?.emergencyContact
      ) {
        return true;
      }

      // Check emergency-only preference
      if (
        recipient.preferences.emergencyOnly &&
        request.priority !== "emergency"
      ) {
        return false;
      }

      return hasChannelPreference;
    });
  }

  private async sendMultiChannelNotification(
    notificationId: string,
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
  ): Promise<NotificationResponse> {
    const response: NotificationResponse = {
      id: notificationId,
      batchId: request.batchId,
      status: "pending",
      sentCount: 0,
      failedCount: 0,
      channels: {},
      sentAt: new Date(),
    };

    const channelPromises: Promise<void>[] = [];

    // WebSocket notifications
    if (request.channels.includes("websocket")) {
      channelPromises.push(
        this.sendWebSocketNotifications(request, recipients, response),
      );
    }

    // Push notifications
    if (request.channels.includes("push")) {
      channelPromises.push(
        this.sendPushNotifications(request, recipients, response),
      );
    }

    // Email notifications
    if (request.channels.includes("email")) {
      channelPromises.push(
        this.sendEmailNotifications(request, recipients, response),
      );
    }

    // SMS notifications
    if (request.channels.includes("sms")) {
      channelPromises.push(
        this.sendSMSNotifications(request, recipients, response),
      );
    }

    // In-app notifications
    if (request.channels.includes("inApp")) {
      channelPromises.push(
        this.sendInAppNotifications(request, recipients, response),
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
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
    response: NotificationResponse,
  ): Promise<void> {
    const wsRecipients = recipients.filter((r) => r.preferences.realTime);
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of wsRecipients) {
      try {
        await websocketService.sendHealthcareMessage(
          "healthcare-notification",
          {
            id: response.id,
            type: request.type,
            title: request.title,
            message: request.message,
            data: request.data,
            priority: request.priority,
            timestamp: new Date().toISOString(),
          },
          {
            priority: request.priority === "emergency" ? "critical" : "high",
            patientSafety: request.type.includes("safety"),
            emergency: request.priority === "emergency",
            dohCompliance: request.data.dohCompliant,
          },
        );
        sent++;
      } catch (error) {
        console.error(
          `Failed to send WebSocket notification to ${recipient.id}:`,
          error,
        );
        errors.push(`${recipient.id}: ${error.message}`);
        failed++;
      }
    }

    response.channels.websocket = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendPushNotifications(
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
    response: NotificationResponse,
  ): Promise<void> {
    const pushRecipients = recipients.filter(
      (r) => r.preferences.push && r.deviceTokens?.length,
    );
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of pushRecipients) {
      try {
        const success = await pushNotificationService.sendNotification(
          this.getHealthcarePushTemplate(request.type),
          {
            title: request.title,
            message: request.message,
            patientName: request.data.patientName,
            location: request.data.emergencyLocation,
            ...request.data,
          },
          {
            targetUsers: [recipient.id],
            priority: request.priority === "emergency" ? "critical" : "high",
            patientId: request.data.patientId,
            emergencyAlert: request.priority === "emergency",
          },
        );
        if (success) sent++;
        else failed++;
      } catch (error) {
        console.error(
          `Failed to send push notification to ${recipient.id}:`,
          error,
        );
        errors.push(`${recipient.id}: ${error.message}`);
        failed++;
      }
    }

    response.channels.push = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendEmailNotifications(
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
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
        await smsEmailNotificationService.sendEmail(
          this.getHealthcareEmailTemplate(request.type),
          [recipient.email],
          {
            recipientName: recipient.name,
            title: request.title,
            message: request.message,
            patientName: request.data.patientName,
            location: request.data.emergencyLocation,
            ...request.data,
          },
          {
            priority: request.priority === "emergency" ? "critical" : "high",
            healthcareContext: {
              patientId: request.data.patientId,
              facilityId: request.data.facilityId,
              urgencyLevel:
                request.priority === "emergency" ? "emergency" : "urgent",
              complianceType: request.data.complianceType,
            },
          },
        );
        sent++;
      } catch (error) {
        console.error(
          `Failed to send email notification to ${recipient.email}:`,
          error,
        );
        errors.push(`${recipient.email}: ${error.message}`);
        failed++;
      }
    }

    response.channels.email = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendSMSNotifications(
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
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
        await smsEmailNotificationService.sendSMS(
          this.getHealthcareSMSTemplate(request.type),
          [recipient.phone!],
          {
            recipientName: recipient.name,
            title: request.title,
            message: request.message,
            patientName: request.data.patientName,
            location: request.data.emergencyLocation,
            ...request.data,
          },
          {
            priority: request.priority === "emergency" ? "critical" : "high",
            healthcareContext: {
              patientId: request.data.patientId,
              facilityId: request.data.facilityId,
              urgencyLevel:
                request.priority === "emergency" ? "emergency" : "urgent",
              complianceType: request.data.complianceType,
            },
          },
        );
        sent++;
      } catch (error) {
        console.error(
          `Failed to send SMS notification to ${recipient.phone}:`,
          error,
        );
        errors.push(`${recipient.phone}: ${error.message}`);
        failed++;
      }
    }

    response.channels.sms = { sent, failed, errors };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  private async sendInAppNotifications(
    request: HealthcareNotificationRequest,
    recipients: HealthcareNotificationRecipient[],
    response: NotificationResponse,
  ): Promise<void> {
    const inAppRecipients = recipients.filter((r) => r.preferences.inApp);
    let sent = 0;
    let failed = 0;

    for (const recipient of inAppRecipients) {
      try {
        this.emit("in-app-notification", {
          recipientId: recipient.id,
          notification: {
            id: response.id,
            type: request.type,
            title: request.title,
            message: request.message,
            data: request.data,
            priority: request.priority,
            timestamp: new Date().toISOString(),
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

    response.channels.inApp = { sent, failed };
    response.sentCount += sent;
    response.failedCount += failed;
  }

  // Helper methods for getting healthcare-specific recipients
  private async getEmergencyContacts(
    roles: string[],
    location?: string,
  ): Promise<HealthcareNotificationRecipient[]> {
    // In production, this would query the database
    // For now, return mock emergency contacts
    return [
      {
        id: "emergency_contact_1",
        name: "Dr. Emergency Response",
        email: "emergency@reyada.com",
        phone: "+971501234567",
        role: "physician",
        department: "Emergency",
        preferences: {
          email: true,
          sms: true,
          push: true,
          realTime: true,
          inApp: true,
        },
        healthcareContext: { emergencyContact: true, dohAuthorized: true },
      },
      {
        id: "emergency_contact_2",
        name: "Nurse Emergency Team",
        email: "nurse.emergency@reyada.com",
        phone: "+971501234568",
        role: "nurse",
        department: "Emergency",
        preferences: {
          email: true,
          sms: true,
          push: true,
          realTime: true,
          inApp: true,
        },
        healthcareContext: { emergencyContact: true, dohAuthorized: true },
      },
    ];
  }

  private async getPatientCareTeam(
    patientId: string,
  ): Promise<HealthcareNotificationRecipient[]> {
    // In production, this would query the database for the patient's care team
    return [
      {
        id: `care_team_${patientId}_1`,
        name: "Dr. Primary Care",
        email: "primary.care@reyada.com",
        phone: "+971501234569",
        role: "physician",
        preferences: {
          email: true,
          sms: false,
          push: true,
          realTime: true,
          inApp: true,
        },
        healthcareContext: { patientIds: [patientId], dohAuthorized: true },
      },
    ];
  }

  private async getPatientAndFamily(
    patientId: string,
  ): Promise<HealthcareNotificationRecipient[]> {
    // In production, this would query the database for patient and family contacts
    return [
      {
        id: `patient_${patientId}`,
        name: "Patient",
        email: "patient@example.com",
        phone: "+971501234570",
        role: "patient",
        preferences: {
          email: false,
          sms: true,
          push: true,
          realTime: false,
          inApp: true,
        },
      },
    ];
  }

  private async getComplianceOfficers(
    roles: string[],
  ): Promise<HealthcareNotificationRecipient[]> {
    // In production, this would query the database for compliance officers
    return [
      {
        id: "compliance_officer_1",
        name: "DOH Compliance Officer",
        email: "compliance@reyada.com",
        phone: "+971501234571",
        role: "admin",
        department: "Compliance",
        preferences: {
          email: true,
          sms: false,
          push: true,
          realTime: true,
          inApp: true,
        },
        healthcareContext: { dohAuthorized: true },
      },
    ];
  }

  // Template mapping methods
  private getHealthcarePushTemplate(type: HealthcareNotificationType): string {
    const templateMap: Record<HealthcareNotificationType, string> = {
      patient_safety_alert: "patient_safety_alert",
      medication_reminder: "medication_reminder",
      appointment_reminder: "appointment_reminder",
      clinical_alert: "clinical_alert",
      emergency_protocol: "emergency_protocol",
      doh_compliance_alert: "doh_compliance_alert",
      jawda_quality_alert: "jawda_quality_alert",
      incident_report: "patient_safety_alert",
      care_plan_update: "clinical_alert",
      vital_signs_alert: "clinical_alert",
      lab_results_alert: "clinical_alert",
      discharge_planning: "clinical_alert",
      infection_control_alert: "patient_safety_alert",
      quality_metrics_alert: "jawda_quality_alert",
      staff_assignment: "clinical_alert",
      equipment_alert: "clinical_alert",
    };
    return templateMap[type] || "clinical_alert";
  }

  private getHealthcareEmailTemplate(type: HealthcareNotificationType): string {
    const templateMap: Record<HealthcareNotificationType, string> = {
      patient_safety_alert: "patient-safety-alert-email",
      medication_reminder: "medication-reminder-email",
      appointment_reminder: "appointment-reminder-email",
      clinical_alert: "clinical-alert-email",
      emergency_protocol: "emergency-alert-email",
      doh_compliance_alert: "doh-compliance-reminder-email",
      jawda_quality_alert: "jawda-quality-alert-email",
      incident_report: "patient-safety-alert-email",
      care_plan_update: "clinical-alert-email",
      vital_signs_alert: "clinical-alert-email",
      lab_results_alert: "clinical-alert-email",
      discharge_planning: "clinical-alert-email",
      infection_control_alert: "patient-safety-alert-email",
      quality_metrics_alert: "jawda-quality-alert-email",
      staff_assignment: "clinical-alert-email",
      equipment_alert: "clinical-alert-email",
    };
    return templateMap[type] || "clinical-alert-email";
  }

  private getHealthcareSMSTemplate(type: HealthcareNotificationType): string {
    const templateMap: Record<HealthcareNotificationType, string> = {
      patient_safety_alert: "patient-safety-alert-sms",
      medication_reminder: "medication-reminder-sms",
      appointment_reminder: "appointment-reminder-sms",
      clinical_alert: "clinical-alert-sms",
      emergency_protocol: "emergency-alert-sms",
      doh_compliance_alert: "compliance-deadline-sms",
      jawda_quality_alert: "quality-alert-sms",
      incident_report: "patient-safety-alert-sms",
      care_plan_update: "clinical-alert-sms",
      vital_signs_alert: "clinical-alert-sms",
      lab_results_alert: "clinical-alert-sms",
      discharge_planning: "clinical-alert-sms",
      infection_control_alert: "patient-safety-alert-sms",
      quality_metrics_alert: "quality-alert-sms",
      staff_assignment: "clinical-alert-sms",
      equipment_alert: "clinical-alert-sms",
    };
    return templateMap[type] || "clinical-alert-sms";
  }

  // Event handlers for real-time healthcare events
  private async handlePatientSafetyIncident(data: any): Promise<void> {
    await this.sendPatientSafetyAlert(
      data.patientId,
      data.patientName,
      data.safetyIssue,
      data.location,
      data.reportedBy,
      data.severity,
    );
  }

  private async handleEmergencyAlert(data: any): Promise<void> {
    await this.sendEmergencyNotification(
      "emergency_protocol",
      data.title,
      data.message,
      {
        emergencyLevel: data.emergencyLevel,
        location: data.location,
        patientId: data.patientId,
        patientName: data.patientName,
        instructions: data.instructions,
      },
    );
  }

  private async handleMedicationReminder(data: any): Promise<void> {
    await this.sendMedicationReminder(
      data.patientId,
      data.patientName,
      data.medicationName,
      data.dosage,
      data.scheduledTime,
    );
  }

  // Utility methods
  private createFailedResponse(
    notificationId: string,
    request: HealthcareNotificationRequest,
    error: string,
  ): NotificationResponse {
    return {
      id: notificationId,
      batchId: request.batchId,
      status: "failed",
      sentCount: 0,
      failedCount: request.recipients.length,
      channels: {},
      sentAt: new Date(),
    };
  }

  private scheduleNotification(
    notificationId: string,
    request: HealthcareNotificationRequest,
  ): NotificationResponse {
    this.notificationQueue.set(notificationId, request);
    console.log(
      `📅 Notification scheduled: ${notificationId} for ${request.scheduledAt}`,
    );

    return {
      id: notificationId,
      batchId: request.batchId,
      status: "scheduled",
      sentCount: 0,
      failedCount: 0,
      channels: {},
      scheduledAt: request.scheduledAt,
    };
  }

  private updateMetrics(
    response: NotificationResponse,
    processingTime: number,
  ): void {
    this.metrics.totalSent += response.sentCount;
    this.metrics.totalFailed += response.failedCount;
    this.metrics.performanceMetrics.averageProcessingTime =
      (this.metrics.performanceMetrics.averageProcessingTime + processingTime) /
      2;
    this.metrics.performanceMetrics.queueSize = this.notificationQueue.size;
  }

  private updateHealthcareMetrics(
    request: HealthcareNotificationRequest,
    response: NotificationResponse,
  ): void {
    switch (request.type) {
      case "patient_safety_alert":
      case "incident_report":
        this.metrics.healthcareMetrics.patientSafetyAlerts++;
        break;
      case "emergency_protocol":
        this.metrics.healthcareMetrics.emergencyNotifications++;
        break;
      case "clinical_alert":
      case "vital_signs_alert":
      case "lab_results_alert":
        this.metrics.healthcareMetrics.clinicalAlerts++;
        break;
      case "medication_reminder":
        this.metrics.healthcareMetrics.medicationReminders++;
        break;
      case "appointment_reminder":
        this.metrics.healthcareMetrics.appointmentReminders++;
        break;
      case "doh_compliance_alert":
        this.metrics.healthcareMetrics.complianceAlerts++;
        break;
      case "jawda_quality_alert":
      case "quality_metrics_alert":
        this.metrics.healthcareMetrics.qualityAlerts++;
        break;
    }
  }

  private updateChannelMetrics(
    channel: string,
    sent: number,
    failed: number,
  ): void {
    if (
      this.metrics.channelPerformance[
        channel as keyof typeof this.metrics.channelPerformance
      ]
    ) {
      const channelMetrics =
        this.metrics.channelPerformance[
          channel as keyof typeof this.metrics.channelPerformance
        ];
      channelMetrics.sent += sent;
      channelMetrics.failed += failed;
      channelMetrics.deliveryRate =
        channelMetrics.sent > 0
          ? (channelMetrics.sent /
              (channelMetrics.sent + channelMetrics.failed)) *
            100
          : 0;
    }
  }

  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const toProcess: string[] = [];

    for (const [id, request] of this.notificationQueue.entries()) {
      if (request.scheduledAt && request.scheduledAt <= now) {
        toProcess.push(id);
      }
    }

    for (const id of toProcess) {
      const request = this.notificationQueue.get(id);
      if (request) {
        try {
          await this.sendHealthcareNotification({
            ...request,
            scheduledAt: undefined,
          });
          this.notificationQueue.delete(id);
          console.log(`✅ Processed scheduled notification: ${id}`);
        } catch (error) {
          console.error(
            `❌ Failed to process scheduled notification ${id}:`,
            error,
          );
          this.addToRetryQueue(id, request);
          this.notificationQueue.delete(id);
        }
      }
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
          await this.sendHealthcareNotification(retryData.request);
          this.retryQueue.delete(id);
          console.log(`✅ Retry successful for notification: ${id}`);
        } catch (error) {
          console.error(`❌ Retry failed for notification ${id}:`, error);

          const maxRetries = retryData.request.retryPolicy?.maxRetries || 3;
          if (retryData.attempts < maxRetries) {
            retryData.attempts++;
            const delay =
              (retryData.request.retryPolicy?.retryDelay || 5000) *
              Math.pow(
                retryData.request.retryPolicy?.backoffMultiplier || 2,
                retryData.attempts - 1,
              );
            retryData.nextRetry = new Date(now.getTime() + delay);
            console.log(
              `🔄 Scheduling retry ${retryData.attempts}/${maxRetries} for ${id}`,
            );
          } else {
            this.retryQueue.delete(id);
            this.emit("notification-failed-permanently", {
              id,
              request: retryData.request,
            });
            console.error(
              `❌ Notification permanently failed after ${maxRetries} retries: ${id}`,
            );
          }
        }
      }
    }
  }

  private addToRetryQueue(
    id: string,
    request: HealthcareNotificationRequest,
  ): void {
    const retryPolicy = request.retryPolicy || {
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2,
    };

    this.retryQueue.set(id, {
      request,
      attempts: 1,
      nextRetry: new Date(Date.now() + retryPolicy.retryDelay),
    });

    console.log(`🔄 Added to retry queue: ${id}`);
  }

  private collectMetrics(): void {
    // Calculate delivery rates
    Object.values(this.metrics.channelPerformance).forEach((channel) => {
      if (channel.sent + channel.failed > 0) {
        channel.deliveryRate =
          (channel.sent / (channel.sent + channel.failed)) * 100;
      }
    });

    // Calculate error rate
    const totalAttempts = this.metrics.totalSent + this.metrics.totalFailed;
    this.metrics.performanceMetrics.errorRate =
      totalAttempts > 0 ? (this.metrics.totalFailed / totalAttempts) * 100 : 0;

    // Calculate retry rate
    this.metrics.performanceMetrics.retryRate = this.retryQueue.size;

    // Report metrics to performance monitoring service
    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "Healthcare_Notifications_Sent",
      value: this.metrics.totalSent,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "Patient_Safety_Alerts_Sent",
      value: this.metrics.healthcareMetrics.patientSafetyAlerts,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "Emergency_Notifications_Sent",
      value: this.metrics.healthcareMetrics.emergencyNotifications,
      unit: "count",
    });

    this.emit("metrics-collected", this.metrics);
  }

  private cleanupOldData(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    // Clean up old delivery tracking data
    for (const [id, response] of this.deliveryTracking.entries()) {
      if (response.sentAt && response.sentAt < sevenDaysAgo) {
        this.deliveryTracking.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old notification records`);
    }
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {
    console.log(
      "🧹 Cleaning up Comprehensive Real-time Notification Service...",
    );

    // Clear intervals
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear queues
    this.notificationQueue.clear();
    this.deliveryTracking.clear();
    this.retryQueue.clear();

    // Remove all listeners
    this.removeAllListeners();

    console.log("✅ Comprehensive Real-time Notification Service cleaned up");
  }
}

// Export singleton instance
export const comprehensiveRealTimeNotificationService =
  ComprehensiveRealTimeNotificationService.getInstance();
export default comprehensiveRealTimeNotificationService;
