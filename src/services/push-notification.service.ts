/**
 * Push Notification Service
 * Provides push notification capabilities for web and mobile platforms
 */

import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";
import websocketService from "./websocket.service";

interface PushNotificationConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
  fcmServerKey?: string;
  apnsKeyId?: string;
  apnsTeamId?: string;
  apnsPrivateKey?: string;
  healthcareMode: boolean;
  dohCompliance: boolean;
  emergencyNotifications: boolean;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  // Healthcare-specific properties
  priority?: "low" | "normal" | "high" | "critical";
  patientId?: string;
  episodeId?: string;
  clinicalAlert?: boolean;
  emergencyAlert?: boolean;
  dohCompliant?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  deviceType: "web" | "android" | "ios";
  subscriptionTime: Date;
  lastUsed: Date;
  active: boolean;
  // Healthcare-specific properties
  userRole?: "patient" | "clinician" | "admin" | "family";
  facilityId?: string;
  departmentId?: string;
  emergencyContact?: boolean;
  dohAuthorized?: boolean;
}

interface NotificationMetrics {
  totalSent: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  subscriptionCount: number;
  activeSubscriptions: number;
  // Healthcare-specific metrics
  emergencyNotificationsSent: number;
  clinicalAlertsSent: number;
  patientNotificationsSent: number;
  dohComplianceNotifications: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  priority: "low" | "normal" | "high" | "critical";
  healthcareSpecific: boolean;
  dohCompliant: boolean;
  variables: string[];
  targetRoles: string[];
}

class PushNotificationService {
  private config: PushNotificationConfig;
  private subscriptions: Map<string, PushSubscription> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private metrics: NotificationMetrics;
  private isInitialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.config = {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
      vapidSubject: process.env.VAPID_SUBJECT || "mailto:admin@reyada.com",
      fcmServerKey: process.env.FCM_SERVER_KEY,
      healthcareMode: true,
      dohCompliance: true,
      emergencyNotifications: true,
    };

    this.metrics = {
      totalSent: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      subscriptionCount: 0,
      activeSubscriptions: 0,
      emergencyNotificationsSent: 0,
      clinicalAlertsSent: 0,
      patientNotificationsSent: 0,
      dohComplianceNotifications: 0,
    };
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🔔 Initializing Push Notification Service...");

      // Check if service workers are supported
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Workers not supported");
      }

      // Check if push notifications are supported
      if (!("PushManager" in window)) {
        throw new Error("Push Notifications not supported");
      }

      // Register service worker
      await this.registerServiceWorker();

      // Initialize notification templates
      this.initializeHealthcareTemplates();

      // Load existing subscriptions
      this.loadSubscriptions();

      // Start monitoring
      this.startMonitoring();

      // Connect to WebSocket for real-time notifications
      this.connectToWebSocket();

      this.isInitialized = true;
      console.log("✅ Push Notification Service initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Push Notification Service:",
        error,
      );
      errorHandlerService.handleError(error, {
        context: "PushNotificationService.initialize",
      });
      throw error;
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.serviceWorkerRegistration =
        await navigator.serviceWorker.register("/sw.js");
      console.log("📱 Service Worker registered successfully");
    } catch (error) {
      console.error("Failed to register Service Worker:", error);
      throw error;
    }
  }

  private initializeHealthcareTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: "patient_safety_alert",
        name: "Patient Safety Alert",
        title: "🚨 Patient Safety Alert",
        body: "Immediate attention required for patient {{patientName}}",
        icon: "/icons/emergency.png",
        priority: "critical",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["patientName", "location", "issue"],
        targetRoles: ["clinician", "admin"],
      },
      {
        id: "medication_reminder",
        name: "Medication Reminder",
        title: "💊 Medication Reminder",
        body: "Time to take {{medicationName}} - {{dosage}}",
        icon: "/icons/medication.png",
        priority: "high",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["medicationName", "dosage", "time"],
        targetRoles: ["patient", "family"],
      },
      {
        id: "appointment_reminder",
        name: "Appointment Reminder",
        title: "📅 Appointment Reminder",
        body: "You have an appointment with {{providerName}} at {{time}}",
        icon: "/icons/appointment.png",
        priority: "normal",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["providerName", "time", "location"],
        targetRoles: ["patient", "family"],
      },
      {
        id: "clinical_alert",
        name: "Clinical Alert",
        title: "⚕️ Clinical Alert",
        body: "Clinical update for {{patientName}}: {{alertMessage}}",
        icon: "/icons/clinical.png",
        priority: "high",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["patientName", "alertMessage", "priority"],
        targetRoles: ["clinician"],
      },
      {
        id: "doh_compliance_alert",
        name: "DOH Compliance Alert",
        title: "🏛️ DOH Compliance Alert",
        body: "Compliance action required: {{complianceType}}",
        icon: "/icons/compliance.png",
        priority: "high",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["complianceType", "deadline", "action"],
        targetRoles: ["admin", "clinician"],
      },
      {
        id: "emergency_protocol",
        name: "Emergency Protocol",
        title: "🚨 EMERGENCY PROTOCOL ACTIVATED",
        body: "Emergency situation: {{emergencyType}} - Report immediately",
        icon: "/icons/emergency.png",
        priority: "critical",
        healthcareSpecific: true,
        dohCompliant: true,
        variables: ["emergencyType", "location", "instructions"],
        targetRoles: ["clinician", "admin"],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });

    console.log(
      `🔔 Initialized ${templates.length} healthcare notification templates`,
    );
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(
    userId?: string,
    userRole?: string,
    facilityId?: string,
  ): Promise<PushSubscription | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error("Service Worker not registered");
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Subscribe to push notifications
      const subscription =
        await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            this.config.vapidPublicKey,
          ),
        });

      // Create subscription object
      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
        userId,
        deviceType: this.detectDeviceType(),
        subscriptionTime: new Date(),
        lastUsed: new Date(),
        active: true,
        userRole: userRole as any,
        facilityId,
        emergencyContact: userRole === "clinician" || userRole === "admin",
        dohAuthorized: true,
      };

      // Store subscription
      const subscriptionId = this.generateSubscriptionId(pushSubscription);
      this.subscriptions.set(subscriptionId, pushSubscription);
      this.saveSubscriptions();

      // Update metrics
      this.metrics.subscriptionCount++;
      this.metrics.activeSubscriptions++;

      console.log("✅ Push notification subscription created");
      this.emit("subscription-created", { subscriptionId, userId, userRole });

      return pushSubscription;
    } catch (error) {
      console.error("❌ Failed to create push subscription:", error);
      errorHandlerService.handleError(error, {
        context: "PushNotificationService.subscribe",
        userId,
        userRole,
      });
      return null;
    }
  }

  /**
   * Send push notification
   */
  async sendNotification(
    templateId: string,
    variables: Record<string, any>,
    options: {
      targetUsers?: string[];
      targetRoles?: string[];
      priority?: "low" | "normal" | "high" | "critical";
      patientId?: string;
      episodeId?: string;
      emergencyAlert?: boolean;
    } = {},
  ): Promise<boolean> {
    const startTime = Date.now();
    this.metrics.totalSent++;

    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Notification template '${templateId}' not found`);
      }

      // Build notification payload
      const payload = this.buildNotificationPayload(
        template,
        variables,
        options,
      );

      // Get target subscriptions
      const targetSubscriptions = this.getTargetSubscriptions(options);

      if (targetSubscriptions.length === 0) {
        console.warn("No target subscriptions found for notification");
        return false;
      }

      // Send to all target subscriptions
      const results = await Promise.allSettled(
        targetSubscriptions.map((subscription) =>
          this.sendToSubscription(subscription, payload),
        ),
      );

      // Update metrics
      const successful = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failed = results.length - successful;

      this.metrics.successfulDeliveries += successful;
      this.metrics.failedDeliveries += failed;
      this.metrics.deliveryRate =
        (this.metrics.successfulDeliveries / this.metrics.totalSent) * 100;
      this.metrics.averageDeliveryTime =
        (this.metrics.averageDeliveryTime + (Date.now() - startTime)) / 2;

      // Update healthcare-specific metrics
      if (options.emergencyAlert) {
        this.metrics.emergencyNotificationsSent++;
      }
      if (template.healthcareSpecific) {
        this.metrics.clinicalAlertsSent++;
      }
      if (options.patientId) {
        this.metrics.patientNotificationsSent++;
      }
      if (template.dohCompliant) {
        this.metrics.dohComplianceNotifications++;
      }

      console.log(
        `📤 Sent notification '${template.name}' to ${successful}/${targetSubscriptions.length} subscribers`,
      );
      this.emit("notification-sent", {
        templateId,
        successful,
        failed,
        total: targetSubscriptions.length,
      });

      return successful > 0;
    } catch (error) {
      this.metrics.failedDeliveries++;
      console.error("❌ Failed to send push notification:", error);
      errorHandlerService.handleError(error, {
        context: "PushNotificationService.sendNotification",
        templateId,
        targetUsers: options.targetUsers?.length || 0,
      });
      return false;
    }
  }

  private buildNotificationPayload(
    template: NotificationTemplate,
    variables: Record<string, any>,
    options: any,
  ): NotificationPayload {
    // Replace variables in title and body
    let title = template.title;
    let body = template.body;

    template.variables.forEach((variable) => {
      const value = variables[variable] || `{{${variable}}}`;
      title = title.replace(new RegExp(`{{${variable}}}`, "g"), value);
      body = body.replace(new RegExp(`{{${variable}}}`, "g"), value);
    });

    return {
      title,
      body,
      icon: template.icon,
      badge: "/icons/badge.png",
      priority: options.priority || template.priority,
      patientId: options.patientId,
      episodeId: options.episodeId,
      clinicalAlert: template.healthcareSpecific,
      emergencyAlert: options.emergencyAlert || false,
      dohCompliant: template.dohCompliant,
      data: {
        templateId: template.id,
        timestamp: Date.now(),
        ...variables,
        ...options,
      },
      actions: this.getNotificationActions(template, options),
      requireInteraction:
        template.priority === "critical" || options.emergencyAlert,
      tag: `${template.id}_${options.patientId || "general"}`,
      timestamp: Date.now(),
    };
  }

  private getNotificationActions(
    template: NotificationTemplate,
    options: any,
  ): NotificationAction[] {
    const actions: NotificationAction[] = [];

    if (template.healthcareSpecific) {
      actions.push({
        action: "view_details",
        title: "View Details",
        icon: "/icons/view.png",
      });

      if (template.priority === "critical" || options.emergencyAlert) {
        actions.push({
          action: "acknowledge",
          title: "Acknowledge",
          icon: "/icons/check.png",
        });
      }
    }

    return actions;
  }

  private getTargetSubscriptions(options: any): PushSubscription[] {
    const subscriptions = Array.from(this.subscriptions.values());

    return subscriptions.filter((subscription) => {
      if (!subscription.active) return false;

      // Filter by target users
      if (options.targetUsers && options.targetUsers.length > 0) {
        return options.targetUsers.includes(subscription.userId);
      }

      // Filter by target roles
      if (options.targetRoles && options.targetRoles.length > 0) {
        return options.targetRoles.includes(subscription.userRole);
      }

      // For emergency alerts, send to all emergency contacts
      if (options.emergencyAlert) {
        return subscription.emergencyContact;
      }

      return true;
    });
  }

  private async sendToSubscription(
    subscription: PushSubscription,
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      // In production, this would use web-push library or FCM
      // For now, simulate the push notification
      await this.simulatePushNotification(subscription, payload);

      // Update subscription last used time
      subscription.lastUsed = new Date();
    } catch (error) {
      console.error("Failed to send to subscription:", error);

      // Mark subscription as inactive if it's no longer valid
      if (error.message.includes("410") || error.message.includes("invalid")) {
        subscription.active = false;
        this.metrics.activeSubscriptions--;
      }

      throw error;
    }
  }

  private async simulatePushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload,
  ): Promise<void> {
    // Simulate push notification delivery
    console.log(
      `📱 Push notification sent to ${subscription.deviceType} device:`,
      {
        title: payload.title,
        body: payload.body,
        priority: payload.priority,
        userId: subscription.userId,
        userRole: subscription.userRole,
      },
    );

    // Simulate delivery delay
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 500),
    );

    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        data: payload.data,
      });

      // Auto-close non-critical notifications
      if (payload.priority !== "critical" && !payload.emergencyAlert) {
        setTimeout(() => notification.close(), 5000);
      }
    }
  }

  private connectToWebSocket(): void {
    // Listen for real-time notification triggers
    websocketService.on("patient-safety-alert", (data: any) => {
      this.sendNotification("patient_safety_alert", data, {
        targetRoles: ["clinician", "admin"],
        priority: "critical",
        emergencyAlert: true,
        patientId: data.patientId,
      });
    });

    websocketService.on("medication-reminder", (data: any) => {
      this.sendNotification("medication_reminder", data, {
        targetUsers: [data.patientId],
        priority: "high",
        patientId: data.patientId,
      });
    });

    websocketService.on("clinical-alert", (data: any) => {
      this.sendNotification("clinical_alert", data, {
        targetRoles: ["clinician"],
        priority: "high",
        patientId: data.patientId,
        episodeId: data.episodeId,
      });
    });

    websocketService.on("emergency-protocol", (data: any) => {
      this.sendNotification("emergency_protocol", data, {
        targetRoles: ["clinician", "admin"],
        priority: "critical",
        emergencyAlert: true,
      });
    });
  }

  // Healthcare-specific notification methods
  async sendPatientSafetyAlert(
    patientId: string,
    patientName: string,
    location: string,
    issue: string,
  ): Promise<boolean> {
    return await this.sendNotification(
      "patient_safety_alert",
      {
        patientName,
        location,
        issue,
      },
      {
        targetRoles: ["clinician", "admin"],
        priority: "critical",
        emergencyAlert: true,
        patientId,
      },
    );
  }

  async sendMedicationReminder(
    patientId: string,
    medicationName: string,
    dosage: string,
    time: string,
  ): Promise<boolean> {
    return await this.sendNotification(
      "medication_reminder",
      {
        medicationName,
        dosage,
        time,
      },
      {
        targetUsers: [patientId],
        priority: "high",
        patientId,
      },
    );
  }

  async sendDOHComplianceAlert(
    complianceType: string,
    deadline: string,
    action: string,
  ): Promise<boolean> {
    return await this.sendNotification(
      "doh_compliance_alert",
      {
        complianceType,
        deadline,
        action,
      },
      {
        targetRoles: ["admin", "clinician"],
        priority: "high",
      },
    );
  }

  async sendEmergencyProtocol(
    emergencyType: string,
    location: string,
    instructions: string,
  ): Promise<boolean> {
    return await this.sendNotification(
      "emergency_protocol",
      {
        emergencyType,
        location,
        instructions,
      },
      {
        targetRoles: ["clinician", "admin"],
        priority: "critical",
        emergencyAlert: true,
      },
    );
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private detectDeviceType(): "web" | "android" | "ios" {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) return "android";
    if (userAgent.includes("iphone") || userAgent.includes("ipad"))
      return "ios";
    return "web";
  }

  private generateSubscriptionId(subscription: PushSubscription): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSubscriptions(): void {
    try {
      const stored = localStorage.getItem("push_subscriptions");
      if (stored) {
        const subscriptions = JSON.parse(stored);
        Object.entries(subscriptions).forEach(([id, sub]) => {
          this.subscriptions.set(id, sub as PushSubscription);
        });
        this.metrics.subscriptionCount = this.subscriptions.size;
        this.metrics.activeSubscriptions = Array.from(
          this.subscriptions.values(),
        ).filter((sub) => sub.active).length;
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    }
  }

  private saveSubscriptions(): void {
    try {
      const subscriptions = Object.fromEntries(this.subscriptions);
      localStorage.setItem("push_subscriptions", JSON.stringify(subscriptions));
    } catch (error) {
      console.error("Failed to save subscriptions:", error);
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.reportMetrics();
      this.cleanupInactiveSubscriptions();
    }, 60000); // Every minute
  }

  private updateMetrics(): void {
    this.metrics.subscriptionCount = this.subscriptions.size;
    this.metrics.activeSubscriptions = Array.from(
      this.subscriptions.values(),
    ).filter((sub) => sub.active).length;

    if (this.metrics.totalSent > 0) {
      this.metrics.deliveryRate =
        (this.metrics.successfulDeliveries / this.metrics.totalSent) * 100;
    }
  }

  private reportMetrics(): void {
    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "Push_Notification_Delivery_Rate",
      value: this.metrics.deliveryRate,
      unit: "percentage",
    });

    performanceMonitoringService.recordMetric({
      type: "notification",
      name: "Active_Push_Subscriptions",
      value: this.metrics.activeSubscriptions,
      unit: "count",
    });

    performanceMonitoringService.recordMetric({
      type: "healthcare",
      name: "Emergency_Notifications_Sent",
      value: this.metrics.emergencyNotificationsSent,
      unit: "count",
    });
  }

  private cleanupInactiveSubscriptions(): void {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    let removedCount = 0;

    for (const [id, subscription] of this.subscriptions.entries()) {
      if (!subscription.active && subscription.lastUsed < cutoffDate) {
        this.subscriptions.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} inactive push subscriptions`);
      this.saveSubscriptions();
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in push notification event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Public API methods
  getMetrics(): NotificationMetrics {
    return { ...this.metrics };
  }

  getSubscriptionCount(): number {
    return this.metrics.activeSubscriptions;
  }

  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  async unsubscribe(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.active = false;
        this.metrics.activeSubscriptions--;
        this.saveSubscriptions();
        return true;
      }
      return false;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "PushNotificationService.unsubscribe",
        subscriptionId,
      });
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.subscriptions.clear();
    this.templates.clear();
    this.eventListeners.clear();

    console.log("🧹 Push Notification Service cleaned up");
  }
}

export const pushNotificationService = new PushNotificationService();
export {
  PushNotificationConfig,
  NotificationPayload,
  PushSubscription,
  NotificationMetrics,
  NotificationTemplate,
};
export default pushNotificationService;
