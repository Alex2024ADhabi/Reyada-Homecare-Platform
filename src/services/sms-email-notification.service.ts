/**
 * SMS/Email Notification Service
 * Handles multi-channel communication with patients and staff
 */

import { AuditLogger } from "./security.service";
import { API_GATEWAY_CONFIG } from "@/config/api.config";

export interface NotificationTemplate {
  id: string;
  name: string;
  type: "sms" | "email" | "push";
  language: "en" | "ar";
  subject?: string;
  content: string;
  variables: string[];
  category:
    | "appointment"
    | "medication"
    | "emergency"
    | "general"
    | "marketing";
}

export interface NotificationRequest {
  templateId: string;
  recipient: {
    phone?: string;
    email?: string;
    name?: string;
    language?: "en" | "ar";
  };
  variables?: { [key: string]: string };
  scheduledTime?: string;
  priority: "low" | "medium" | "high" | "urgent";
  metadata?: {
    patientId?: string;
    appointmentId?: string;
    episodeId?: string;
  };
}

export interface NotificationResponse {
  notificationId: string;
  status: "queued" | "sent" | "delivered" | "failed" | "cancelled";
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  cost?: number;
  provider?: string;
}

class SMSEmailNotificationService {
  private readonly smsApiUrl: string;
  private readonly emailApiUrl: string;
  private readonly smsApiKey: string;
  private readonly emailApiKey: string;
  private readonly fromEmail: string;
  private readonly fromSMS: string;

  constructor() {
    this.smsApiUrl = process.env.SMS_API_URL || "https://api.sms-provider.ae";
    this.emailApiUrl =
      process.env.EMAIL_API_URL || "https://api.email-provider.ae";
    this.smsApiKey = process.env.SMS_API_KEY || "";
    this.emailApiKey = process.env.EMAIL_API_KEY || "";
    this.fromEmail = process.env.FROM_EMAIL || "noreply@reyadahomecare.ae";
    this.fromSMS = process.env.FROM_SMS || "Reyada";
  }

  async sendSMS(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      this.validateSMSRequest(request);
      const template = await this.getTemplate(request.templateId);
      const processedContent = this.processTemplate(
        template.content,
        request.variables || {},
      );

      const smsPayload = {
        to: request.recipient.phone,
        from: this.fromSMS,
        message: processedContent,
        priority: request.priority,
        scheduledTime: request.scheduledTime,
        metadata: request.metadata,
      };

      const response = await fetch(`${this.smsApiUrl}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.smsApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(smsPayload),
      });

      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }

      const result = await response.json();
      const notificationResponse: NotificationResponse = {
        notificationId: result.messageId,
        status: "sent",
        sentAt: new Date().toISOString(),
        cost: result.cost,
        provider: "SMS Gateway",
      };

      AuditLogger.logSecurityEvent({
        type: "sms_sent",
        details: {
          notificationId: notificationResponse.notificationId,
          recipient: this.maskPhoneNumber(request.recipient.phone!),
          templateId: request.templateId,
          priority: request.priority,
          patientId: request.metadata?.patientId,
        },
        severity: "low",
        complianceImpact: false,
      });

      return notificationResponse;
    } catch (error) {
      console.error("SMS sending error:", error);
      throw error;
    }
  }

  async sendEmail(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      this.validateEmailRequest(request);
      const template = await this.getTemplate(request.templateId);
      const processedSubject = this.processTemplate(
        template.subject || "",
        request.variables || {},
      );
      const processedContent = this.processTemplate(
        template.content,
        request.variables || {},
      );

      const emailPayload = {
        to: request.recipient.email,
        from: this.fromEmail,
        subject: processedSubject,
        html: processedContent,
        priority: request.priority,
        scheduledTime: request.scheduledTime,
        metadata: request.metadata,
      };

      const response = await fetch(`${this.emailApiUrl}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.emailApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      const result = await response.json();
      const notificationResponse: NotificationResponse = {
        notificationId: result.messageId,
        status: "sent",
        sentAt: new Date().toISOString(),
        provider: "Email Gateway",
      };

      AuditLogger.logSecurityEvent({
        type: "email_sent",
        details: {
          notificationId: notificationResponse.notificationId,
          recipient: this.maskEmail(request.recipient.email!),
          templateId: request.templateId,
          priority: request.priority,
          patientId: request.metadata?.patientId,
        },
        severity: "low",
        complianceImpact: false,
      });

      return notificationResponse;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }

  async sendAppointmentReminder(appointmentData: {
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    appointmentDate: string;
    appointmentTime: string;
    providerName: string;
    language?: "en" | "ar";
  }): Promise<NotificationResponse[]> {
    const results: NotificationResponse[] = [];
    const variables = {
      patientName: appointmentData.patientName,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      providerName: appointmentData.providerName,
    };

    if (appointmentData.patientPhone) {
      try {
        const smsResult = await this.sendSMS({
          templateId: "appointment-reminder-sms",
          recipient: {
            phone: appointmentData.patientPhone,
            name: appointmentData.patientName,
            language: appointmentData.language || "en",
          },
          variables,
          priority: "medium",
        });
        results.push(smsResult);
      } catch (error) {
        console.error("SMS appointment reminder failed:", error);
      }
    }

    if (appointmentData.patientEmail) {
      try {
        const emailResult = await this.sendEmail({
          templateId: "appointment-reminder-email",
          recipient: {
            email: appointmentData.patientEmail,
            name: appointmentData.patientName,
            language: appointmentData.language || "en",
          },
          variables,
          priority: "medium",
        });
        results.push(emailResult);
      } catch (error) {
        console.error("Email appointment reminder failed:", error);
      }
    }

    return results;
  }

  private validateSMSRequest(request: NotificationRequest): void {
    if (!request.recipient.phone) {
      throw new Error("Phone number is required for SMS");
    }
    if (!this.isValidPhoneNumber(request.recipient.phone)) {
      throw new Error("Invalid phone number format");
    }
  }

  private validateEmailRequest(request: NotificationRequest): void {
    if (!request.recipient.email) {
      throw new Error("Email address is required for email");
    }
    if (!this.isValidEmail(request.recipient.email)) {
      throw new Error("Invalid email address format");
    }
  }

  private async getTemplate(templateId: string): Promise<NotificationTemplate> {
    return {
      id: templateId,
      name: "Mock Template",
      type: "sms",
      language: "en",
      content: "Hello {{patientName}}, this is a test message.",
      variables: ["patientName"],
      category: "general",
    };
  }

  private processTemplate(
    template: string,
    variables: { [key: string]: string },
  ): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, "g"), value);
    });
    return processed;
  }

  private isValidPhoneNumber(phone: string): boolean {
    const uaePhoneRegex = /^(\+971|00971|971)?[0-9]{8,9}$/;
    return uaePhoneRegex.test(phone.replace(/[\s-]/g, ""));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return phone;
    return phone.substring(0, 3) + "****" + phone.substring(phone.length - 2);
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return email;
    return local.substring(0, 2) + "****@" + domain;
  }
}

export const smsEmailNotificationService = new SMSEmailNotificationService();
export default SMSEmailNotificationService;
