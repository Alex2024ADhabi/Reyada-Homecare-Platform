/**
 * Notification Service for Governance Library
 * Handles staff notifications for document publishing and updates
 */

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  emailTemplate: string;
  smsTemplate: string;
  pushTemplate: string;
  variables: string[];
}

export type NotificationType =
  | "document_published"
  | "document_updated"
  | "document_expiring"
  | "acknowledgment_required"
  | "compliance_alert"
  | "system_announcement";

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
  };
  channels: ("email" | "sms" | "push" | "in_app")[];
  scheduledAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface NotificationResponse {
  id: string;
  status: "sent" | "pending" | "failed" | "scheduled";
  sentCount: number;
  failedCount: number;
  details: {
    email?: { sent: number; failed: number; errors?: string[] };
    sms?: { sent: number; failed: number; errors?: string[] };
    push?: { sent: number; failed: number; errors?: string[] };
    inApp?: { sent: number; failed: number; errors?: string[] };
  };
  sentAt?: string;
  scheduledAt?: string;
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
}

class NotificationService {
  private baseUrl: string;
  private headers: Record<string, string>;
  private templates: Map<NotificationType, NotificationTemplate>;

  constructor() {
    this.baseUrl = "/api/notifications";
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: "doc_published",
        name: "Document Published",
        type: "document_published",
        subject: "New Governance Document Published: {{documentTitle}}",
        emailTemplate: `
          <h2>New Document Published</h2>
          <p>A new {{documentType}} has been published to the Governance Library:</p>
          <h3>{{documentTitle}}</h3>
          <p>This document is now available for review and {{#acknowledgmentRequired}}requires your acknowledgment{{/acknowledgmentRequired}}.</p>
          <p><a href="{{documentUrl}}">View Document</a></p>
          <p>Please review this document at your earliest convenience.</p>
        `,
        smsTemplate:
          "New {{documentType}} published: {{documentTitle}}. Review required. Access via Governance Library.",
        pushTemplate: "📋 New {{documentType}}: {{documentTitle}}",
        variables: [
          "documentTitle",
          "documentType",
          "documentUrl",
          "acknowledgmentRequired",
        ],
      },
      {
        id: "doc_updated",
        name: "Document Updated",
        type: "document_updated",
        subject: "Document Updated: {{documentTitle}}",
        emailTemplate: `
          <h2>Document Updated</h2>
          <p>The following document has been updated:</p>
          <h3>{{documentTitle}}</h3>
          <p>Please review the updated version and acknowledge receipt if required.</p>
          <p><a href="{{documentUrl}}">View Updated Document</a></p>
        `,
        smsTemplate:
          "Document updated: {{documentTitle}}. Please review the latest version.",
        pushTemplate: "📝 Updated: {{documentTitle}}",
        variables: ["documentTitle", "documentUrl"],
      },
      {
        id: "doc_expiring",
        name: "Document Expiring",
        type: "document_expiring",
        subject: "Document Expiring Soon: {{documentTitle}}",
        emailTemplate: `
          <h2>Document Expiring Soon</h2>
          <p>The following document will expire on {{expiryDate}}:</p>
          <h3>{{documentTitle}}</h3>
          <p>Please review and take necessary action before the expiry date.</p>
          <p><a href="{{documentUrl}}">View Document</a></p>
        `,
        smsTemplate:
          "Document expiring {{expiryDate}}: {{documentTitle}}. Review required.",
        pushTemplate: "⏰ Expiring: {{documentTitle}}",
        variables: ["documentTitle", "expiryDate", "documentUrl"],
      },
      {
        id: "acknowledgment_required",
        name: "Acknowledgment Required",
        type: "acknowledgment_required",
        subject: "Action Required: Acknowledge {{documentTitle}}",
        emailTemplate: `
          <h2>Acknowledgment Required</h2>
          <p>You are required to acknowledge receipt and understanding of:</p>
          <h3>{{documentTitle}}</h3>
          <p>Please click the link below to acknowledge:</p>
          <p><a href="{{acknowledgmentUrl}}">Acknowledge Document</a></p>
          <p><strong>This acknowledgment is mandatory and must be completed.</strong></p>
        `,
        smsTemplate:
          "URGENT: Acknowledge {{documentTitle}}. Access Governance Library to complete.",
        pushTemplate: "❗ Acknowledgment Required: {{documentTitle}}",
        variables: ["documentTitle", "acknowledgmentUrl"],
      },
      {
        id: "compliance_alert",
        name: "Compliance Alert",
        type: "compliance_alert",
        subject: "Compliance Alert: Score {{complianceScore}}%",
        emailTemplate: `
          <h2>Compliance Alert</h2>
          <p>The compliance score has changed to {{complianceScore}}%.</p>
          <p>{{customMessage}}</p>
          <p>Please review the compliance dashboard for details.</p>
          <p><a href="{{complianceUrl}}">View Compliance Dashboard</a></p>
        `,
        smsTemplate:
          "Compliance Alert: Score {{complianceScore}}%. Review required.",
        pushTemplate: "🛡️ Compliance: {{complianceScore}}%",
        variables: ["complianceScore", "customMessage", "complianceUrl"],
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.type, template);
    });
  }

  async sendNotification(
    request: NotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      // Get template
      const template = this.templates.get(request.type);
      if (!template) {
        throw new Error(
          `Template not found for notification type: ${request.type}`,
        );
      }

      // Filter recipients based on their preferences
      const filteredRecipients = this.filterRecipientsByPreferences(
        request.recipients,
        request.channels,
      );

      // Prepare notification data
      const notificationData = {
        ...request,
        recipients: filteredRecipients,
        template,
      };

      // In a real implementation, this would call the actual notification API
      const response = await this.mockSendNotification(notificationData);

      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async sendDocumentPublishedNotification(
    documentId: string,
    documentTitle: string,
    documentType: string,
    recipients: NotificationRecipient[],
    options: {
      acknowledgmentRequired?: boolean;
      urgentNotification?: boolean;
      customMessage?: string;
    } = {},
  ): Promise<NotificationResponse> {
    const request: NotificationRequest = {
      type: "document_published",
      recipients,
      data: {
        documentId,
        documentTitle,
        documentType,
        acknowledgmentRequired: options.acknowledgmentRequired || false,
        urgentNotification: options.urgentNotification || false,
        customMessage: options.customMessage,
      },
      channels: ["email", "in_app"],
      priority: options.urgentNotification ? "urgent" : "medium",
    };

    if (options.urgentNotification) {
      request.channels.push("push");
    }

    return this.sendNotification(request);
  }

  async sendBulkDocumentNotification(
    documents: Array<{
      id: string;
      title: string;
      type: string;
    }>,
    recipients: NotificationRecipient[],
    options: {
      acknowledgmentRequired?: boolean;
      customMessage?: string;
    } = {},
  ): Promise<NotificationResponse[]> {
    const responses: NotificationResponse[] = [];

    for (const document of documents) {
      const response = await this.sendDocumentPublishedNotification(
        document.id,
        document.title,
        document.type,
        recipients,
        options,
      );
      responses.push(response);

      // Add delay between notifications to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return responses;
  }

  async getNotificationHistory(filters?: {
    type?: NotificationType;
    dateRange?: { start: string; end: string };
    status?: string;
  }): Promise<NotificationHistory[]> {
    try {
      // In a real implementation, this would fetch from the API
      const mockHistory: NotificationHistory[] = [
        {
          id: "notif-001",
          type: "document_published",
          subject:
            "New Governance Document Published: Patient Safety Policy v3.2",
          recipients: 247,
          channels: ["email", "in_app"],
          status: "sent",
          sentAt: "2024-01-20T15:30:00Z",
          openRate: 87,
          clickRate: 65,
          acknowledgmentRate: 78,
        },
        {
          id: "notif-002",
          type: "document_expiring",
          subject: "Document Expiring Soon: Quality Manual v2.1",
          recipients: 156,
          channels: ["email", "push"],
          status: "sent",
          sentAt: "2024-01-19T09:00:00Z",
          openRate: 92,
          clickRate: 71,
        },
      ];

      return mockHistory;
    } catch (error) {
      console.error("Error fetching notification history:", error);
      throw error;
    }
  }

  async getRecipients(filters?: {
    department?: string;
    role?: string;
    accessLevel?: string;
  }): Promise<NotificationRecipient[]> {
    try {
      // In a real implementation, this would fetch from the user management API
      const mockRecipients: NotificationRecipient[] = [
        {
          id: "user-001",
          name: "Dr. Sarah Ahmed",
          email: "sarah.ahmed@reyada.ae",
          phone: "+971501234567",
          department: "Clinical",
          role: "Senior Physician",
          preferences: {
            email: true,
            sms: false,
            push: true,
            inApp: true,
          },
        },
        {
          id: "user-002",
          name: "Nurse Manager Fatima",
          email: "fatima.manager@reyada.ae",
          phone: "+971507654321",
          department: "Nursing",
          role: "Nurse Manager",
          preferences: {
            email: true,
            sms: true,
            push: true,
            inApp: true,
          },
        },
      ];

      return mockRecipients;
    } catch (error) {
      console.error("Error fetching recipients:", error);
      throw error;
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
            return recipient.preferences.email;
          case "sms":
            return recipient.preferences.sms;
          case "push":
            return recipient.preferences.push;
          case "in_app":
            return recipient.preferences.inApp;
          default:
            return false;
        }
      });
    });
  }

  private async mockSendNotification(data: any): Promise<NotificationResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const totalRecipients = data.recipients.length;
    const successRate = 0.95; // 95% success rate
    const sentCount = Math.floor(totalRecipients * successRate);
    const failedCount = totalRecipients - sentCount;

    return {
      id: `notif-${Date.now()}`,
      status: failedCount > 0 ? "partial" : "sent",
      sentCount,
      failedCount,
      details: {
        email: data.channels.includes("email")
          ? {
              sent: Math.floor(sentCount * 0.9),
              failed: Math.floor(failedCount * 0.5),
            }
          : undefined,
        push: data.channels.includes("push")
          ? {
              sent: Math.floor(sentCount * 0.8),
              failed: Math.floor(failedCount * 0.3),
            }
          : undefined,
        inApp: data.channels.includes("in_app")
          ? {
              sent: sentCount,
              failed: 0,
            }
          : undefined,
      },
      sentAt: new Date().toISOString(),
    };
  }

  // Utility methods
  async testNotification(
    type: NotificationType,
    recipient: NotificationRecipient,
  ): Promise<boolean> {
    try {
      const testRequest: NotificationRequest = {
        type,
        recipients: [recipient],
        data: {
          documentTitle: "Test Document",
          documentType: "policy",
        },
        channels: ["email"],
        priority: "low",
      };

      const response = await this.sendNotification(testRequest);
      return response.status === "sent";
    } catch (error) {
      console.error("Test notification failed:", error);
      return false;
    }
  }

  getTemplate(type: NotificationType): NotificationTemplate | undefined {
    return this.templates.get(type);
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
