/**
 * Real-time Communication Service
 * Handles messaging, emergency alerts, and team collaboration
 */
import { AuditLogger } from "./security.service";
import { serviceWorkerService } from "./service-worker.service";
class CommunicationService {
    constructor() {
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "channels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "emergencyAlerts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "userNotificationChannels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "websocketConnections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "emergencyContacts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "escalationWorkflows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.initializeDefaultChannels();
        this.setupEmergencyProtocols();
    }
    /**
     * Initialize default communication channels
     */
    initializeDefaultChannels() {
        const defaultChannels = [
            {
                id: "general",
                name: "General",
                type: "group",
                participants: [],
                createdAt: new Date().toISOString(),
                settings: {
                    encryption: true,
                    notifications: true,
                    emergencyAlerts: true,
                    voiceEnabled: true,
                },
            },
            {
                id: "emergency",
                name: "Emergency Response",
                type: "emergency",
                participants: [],
                createdAt: new Date().toISOString(),
                settings: {
                    encryption: true,
                    notifications: true,
                    emergencyAlerts: true,
                    voiceEnabled: true,
                },
                metadata: {
                    emergencyLevel: "critical",
                },
            },
            {
                id: "clinical",
                name: "Clinical Team",
                type: "group",
                participants: [],
                createdAt: new Date().toISOString(),
                settings: {
                    encryption: true,
                    notifications: true,
                    emergencyAlerts: true,
                    voiceEnabled: true,
                },
                metadata: {
                    department: "clinical",
                },
            },
        ];
        defaultChannels.forEach((channel) => {
            this.channels.set(channel.id, channel);
            this.messages.set(channel.id, []);
        });
    }
    /**
     * Setup emergency response protocols
     */
    setupEmergencyProtocols() {
        // Define escalation workflows
        const emergencyEscalation = {
            medical: {
                level1: { timeout: 2, contacts: ["nurse", "doctor"] },
                level2: { timeout: 5, contacts: ["senior_doctor", "supervisor"] },
                level3: { timeout: 10, contacts: ["emergency_services", "management"] },
            },
            security: {
                level1: { timeout: 1, contacts: ["security_guard", "supervisor"] },
                level2: { timeout: 3, contacts: ["security_manager", "police"] },
                level3: { timeout: 5, contacts: ["emergency_services", "management"] },
            },
            fire: {
                level1: { timeout: 1, contacts: ["fire_warden", "security"] },
                level2: { timeout: 2, contacts: ["fire_department", "management"] },
                level3: {
                    timeout: 3,
                    contacts: ["emergency_services", "evacuation_team"],
                },
            },
        };
        Object.entries(emergencyEscalation).forEach(([type, workflow]) => {
            this.escalationWorkflows.set(type, workflow);
        });
    }
    /**
     * Send a message
     */
    async sendMessage(messageData) {
        try {
            const messageId = this.generateMessageId();
            const message = {
                ...messageData,
                id: messageId,
                timestamp: new Date().toISOString(),
                status: "sent",
            };
            // Store message
            const channelId = messageData.channelId || "general";
            const channelMessages = this.messages.get(channelId) || [];
            channelMessages.push(message);
            this.messages.set(channelId, channelMessages);
            // Send real-time notifications
            await this.broadcastMessage(message);
            // Handle emergency messages
            if (message.type === "emergency" || message.priority === "critical") {
                await this.handleEmergencyMessage(message);
            }
            // Log message for audit
            AuditLogger.logSecurityEvent({
                type: "data_access",
                userId: message.senderId,
                resource: `message_${messageId}`,
                details: {
                    messageType: message.type,
                    priority: message.priority,
                    recipientCount: message.recipientIds.length,
                    encrypted: message.encrypted,
                },
                severity: message.priority === "critical" ? "high" : "low",
            });
            return messageId;
        }
        catch (error) {
            console.error("Failed to send message:", error);
            throw error;
        }
    }
    /**
     * Broadcast emergency alert
     */
    async broadcastEmergencyAlert(alertData) {
        try {
            const alertId = this.generateAlertId();
            const alert = {
                ...alertData,
                id: alertId,
                timestamp: new Date().toISOString(),
                status: "active",
                escalationLevel: 1,
            };
            // Store alert
            this.emergencyAlerts.set(alertId, alert);
            // Send to emergency channel
            const emergencyMessage = {
                id: this.generateMessageId(),
                senderId: "system",
                recipientIds: alert.recipients,
                content: `🚨 EMERGENCY ALERT: ${alert.title}\n${alert.message}`,
                type: "emergency",
                priority: "critical",
                timestamp: new Date().toISOString(),
                status: "sent",
                encrypted: true,
                channelId: "emergency",
                metadata: {
                    emergencyType: alert.type,
                    escalationLevel: alert.escalationLevel,
                    location: alert.location,
                },
            };
            await this.sendMessage(emergencyMessage);
            // Multi-channel notification
            await this.sendMultiChannelNotification({
                title: `Emergency Alert: ${alert.title}`,
                message: alert.message,
                priority: "critical",
                recipients: alert.recipients,
                channels: ["push", "sms", "email"],
                metadata: {
                    alertId,
                    emergencyType: alert.type,
                    location: alert.location,
                },
            });
            // Setup auto-escalation if required
            if (alert.autoEscalationTime) {
                this.setupAutoEscalation(alertId, alert.autoEscalationTime);
            }
            // Log emergency alert
            AuditLogger.logSecurityEvent({
                type: "system_event",
                details: {
                    alertId,
                    alertType: alert.type,
                    severity: alert.severity,
                    location: alert.location,
                    triggeredBy: alert.triggeredBy,
                },
                severity: "critical",
                complianceImpact: true,
            });
            return alertId;
        }
        catch (error) {
            console.error("Failed to broadcast emergency alert:", error);
            throw error;
        }
    }
    /**
     * Send multi-channel notifications with enhanced routing and delivery optimization
     */
    async sendMultiChannelNotification(notificationData) {
        try {
            const { title, message, priority, recipients, channels, scheduledTime, template, attachments, metadata, } = notificationData;
            const notificationId = `NOTIF-${Date.now()}`;
            const deliveryStatus = {
                total: recipients.length * channels.length,
                sent: 0,
                delivered: 0,
                failed: 0,
                pending: 0,
            };
            // Enhanced delivery with intelligent routing
            for (const recipient of recipients) {
                const userChannels = this.userNotificationChannels.get(recipient) || [];
                const recipientPreferences = await this.getRecipientPreferences(recipient);
                for (const channelType of channels) {
                    const userChannel = userChannels.find((ch) => ch.type === channelType && ch.enabled);
                    if (userChannel && this.shouldSendToChannel(userChannel, priority)) {
                        try {
                            // Check optimal delivery time
                            const optimalTime = await this.calculateOptimalDeliveryTime(recipient, priority, scheduledTime);
                            if (optimalTime === "immediate" || !scheduledTime) {
                                await this.sendToChannel(userChannel, {
                                    title,
                                    message,
                                    priority,
                                    template,
                                    attachments,
                                    metadata: {
                                        ...metadata,
                                        notificationId,
                                        recipientPreferences,
                                        deliveryOptimization: true,
                                    },
                                });
                                deliveryStatus.sent++;
                            }
                            else {
                                // Schedule for later delivery
                                await this.scheduleNotification({
                                    userChannel,
                                    data: {
                                        title,
                                        message,
                                        priority,
                                        template,
                                        attachments,
                                        metadata,
                                    },
                                    scheduledTime: optimalTime,
                                });
                                deliveryStatus.pending++;
                            }
                        }
                        catch (error) {
                            console.error(`Failed to send ${channelType} to ${recipient}:`, error);
                            deliveryStatus.failed++;
                            // Try fallback channels
                            await this.tryFallbackChannels(recipient, channelType, {
                                title,
                                message,
                                priority,
                                metadata,
                            });
                        }
                    }
                }
            }
            return {
                notificationId,
                status: deliveryStatus.failed === 0 ? "success" : "partial_success",
                deliveryStatus,
                estimatedDelivery: scheduledTime || "immediate",
            };
        }
        catch (error) {
            console.error("Failed to send multi-channel notification:", error);
            throw error;
        }
    }
    /**
     * Handle panic button activation
     */
    async activatePanicButton(userId, location) {
        try {
            // Get user's current location if not provided
            const currentLocation = location || (await this.getCurrentLocation());
            // Create emergency alert
            const alertId = await this.broadcastEmergencyAlert({
                type: "general",
                severity: "critical",
                title: "PANIC BUTTON ACTIVATED",
                message: `Emergency assistance requested by user ${userId}`,
                location: currentLocation
                    ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        address: await this.getAddressFromCoordinates(currentLocation),
                    }
                    : undefined,
                triggeredBy: userId,
                recipients: await this.getEmergencyContacts(userId),
                responseRequired: true,
                autoEscalationTime: 2, // 2 minutes
            });
            // Trigger immediate escalation workflow
            await this.triggerEscalationWorkflow("general", alertId, userId);
            // Log panic button activation
            AuditLogger.logSecurityEvent({
                type: "system_event",
                userId,
                details: {
                    action: "panic_button_activated",
                    alertId,
                    location: currentLocation,
                },
                severity: "critical",
                complianceImpact: true,
            });
            return alertId;
        }
        catch (error) {
            console.error("Failed to activate panic button:", error);
            throw error;
        }
    }
    /**
     * Get messages for a channel
     */
    getMessages(channelId, limit = 50) {
        const messages = this.messages.get(channelId) || [];
        return messages.slice(-limit);
    }
    /**
     * Get all channels
     */
    getChannels() {
        return Array.from(this.channels.values());
    }
    /**
     * Get active emergency alerts
     */
    getActiveEmergencyAlerts() {
        return Array.from(this.emergencyAlerts.values()).filter((alert) => alert.status === "active");
    }
    /**
     * Acknowledge emergency alert
     */
    async acknowledgeEmergencyAlert(alertId, userId) {
        const alert = this.emergencyAlerts.get(alertId);
        if (alert) {
            alert.status = "acknowledged";
            this.emergencyAlerts.set(alertId, alert);
            // Notify other recipients
            await this.sendMessage({
                senderId: "system",
                recipientIds: alert.recipients,
                content: `Emergency alert ${alertId} acknowledged by ${userId}`,
                type: "alert",
                priority: "high",
                encrypted: true,
                channelId: "emergency",
            });
            AuditLogger.logSecurityEvent({
                type: "user_action",
                userId,
                details: {
                    action: "emergency_alert_acknowledged",
                    alertId,
                },
                severity: "medium",
            });
        }
    }
    /**
     * Resolve emergency alert
     */
    async resolveEmergencyAlert(alertId, userId, resolution) {
        const alert = this.emergencyAlerts.get(alertId);
        if (alert) {
            alert.status = "resolved";
            this.emergencyAlerts.set(alertId, alert);
            // Send resolution message
            await this.sendMessage({
                senderId: userId,
                recipientIds: alert.recipients,
                content: `Emergency alert ${alertId} resolved: ${resolution}`,
                type: "alert",
                priority: "medium",
                encrypted: true,
                channelId: "emergency",
            });
            AuditLogger.logSecurityEvent({
                type: "user_action",
                userId,
                details: {
                    action: "emergency_alert_resolved",
                    alertId,
                    resolution,
                },
                severity: "low",
            });
        }
    }
    /**
     * Setup user notification channels
     */
    setupUserNotificationChannels(userId, channels) {
        this.userNotificationChannels.set(userId, channels);
    }
    /**
     * Add user to channel
     */
    addUserToChannel(channelId, userId) {
        const channel = this.channels.get(channelId);
        if (channel && !channel.participants.includes(userId)) {
            channel.participants.push(userId);
            this.channels.set(channelId, channel);
        }
    }
    /**
     * Remove user from channel
     */
    removeUserFromChannel(channelId, userId) {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.participants = channel.participants.filter((id) => id !== userId);
            this.channels.set(channelId, channel);
        }
    }
    // Private helper methods
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async broadcastMessage(message) {
        // Simulate WebSocket broadcasting
        console.log("Broadcasting message:", message.id);
        // In a real implementation, this would send to WebSocket connections
        // this.websocketConnections.forEach((ws, userId) => {
        //   if (message.recipientIds.includes(userId)) {
        //     ws.send(JSON.stringify({ type: 'message', data: message }));
        //   }
        // });
    }
    async handleEmergencyMessage(message) {
        // Trigger emergency protocols for critical messages
        if (message.priority === "critical") {
            await this.sendMultiChannelNotification({
                title: "Emergency Message",
                message: message.content,
                priority: "critical",
                recipients: message.recipientIds,
                channels: ["push", "sms"],
            });
        }
    }
    shouldSendToChannel(channel, priority) {
        const priorityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        return (priorityLevels[priority] >=
            priorityLevels[channel.priority]);
    }
    async sendToChannel(channel, data) {
        switch (channel.type) {
            case "push":
                await this.sendPushNotification(channel, data);
                break;
            case "sms":
                await this.sendSMSNotification(channel, data);
                break;
            case "email":
                await this.sendEmailNotification(channel, data);
                break;
            case "voice":
                await this.sendVoiceNotification(channel, data);
                break;
        }
    }
    async sendPushNotification(channel, data) {
        if (channel.settings.push) {
            // Use service worker for push notifications
            serviceWorkerService.addSyncTask({
                type: "api-call",
                data: {
                    type: "push_notification",
                    deviceTokens: channel.settings.push.deviceTokens,
                    title: data.title,
                    message: data.message,
                    sound: channel.settings.push.sound,
                    vibration: channel.settings.push.vibration,
                },
                url: "/api/notifications/push",
                method: "POST",
                priority: "high",
                maxRetries: 3,
            });
        }
    }
    async sendSMSNotification(channel, data) {
        if (channel.settings.sms) {
            serviceWorkerService.addSyncTask({
                type: "api-call",
                data: {
                    type: "sms",
                    phoneNumber: channel.settings.sms.phoneNumber,
                    message: `${data.title}: ${data.message}`,
                    provider: channel.settings.sms.provider,
                },
                url: "/api/notifications/sms",
                method: "POST",
                priority: "high",
                maxRetries: 3,
            });
        }
    }
    async sendEmailNotification(channel, data) {
        if (channel.settings.email) {
            serviceWorkerService.addSyncTask({
                type: "api-call",
                data: {
                    type: "email",
                    to: channel.settings.email.address,
                    subject: data.title,
                    body: data.message,
                    template: channel.settings.email.template,
                },
                url: "/api/notifications/email",
                method: "POST",
                priority: "medium",
                maxRetries: 3,
            });
        }
    }
    async sendVoiceNotification(channel, data) {
        if (channel.settings.voice) {
            serviceWorkerService.addSyncTask({
                type: "api-call",
                data: {
                    type: "voice_call",
                    phoneNumber: channel.settings.voice.phoneNumber,
                    message: data.message,
                    language: channel.settings.voice.language,
                },
                url: "/api/notifications/voice",
                method: "POST",
                priority: "high",
                maxRetries: 2,
            });
        }
    }
    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                }, () => resolve(null), { timeout: 5000 });
            }
            else {
                resolve(null);
            }
        });
    }
    async getAddressFromCoordinates(coords) {
        // In a real implementation, this would use a geocoding service
        return `Location: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }
    async getEmergencyContacts(userId) {
        return (this.emergencyContacts.get(userId) || ["emergency_services", "supervisor"]);
    }
    setupAutoEscalation(alertId, timeoutMinutes) {
        setTimeout(async () => {
            const alert = this.emergencyAlerts.get(alertId);
            if (alert && alert.status === "active") {
                alert.escalationLevel += 1;
                this.emergencyAlerts.set(alertId, alert);
                await this.triggerEscalationWorkflow(alert.type, alertId, alert.triggeredBy);
            }
        }, timeoutMinutes * 60 * 1000);
    }
    async triggerEscalationWorkflow(emergencyType, alertId, userId) {
        const workflow = this.escalationWorkflows.get(emergencyType);
        if (workflow) {
            const alert = this.emergencyAlerts.get(alertId);
            if (alert) {
                const levelKey = `level${alert.escalationLevel}`;
                const level = workflow[levelKey];
                if (level) {
                    // Send notifications to escalation contacts
                    await this.sendMultiChannelNotification({
                        title: `ESCALATED: ${alert.title}`,
                        message: `Emergency alert escalated to level ${alert.escalationLevel}`,
                        priority: "critical",
                        recipients: level.contacts,
                        channels: ["push", "sms", "voice"],
                        metadata: { alertId, escalationLevel: alert.escalationLevel },
                    });
                }
            }
        }
    }
    /**
     * Set emergency contacts for a user
     */
    setEmergencyContacts(userId, contacts) {
        this.emergencyContacts.set(userId, contacts);
    }
    /**
     * Enhanced recipient preferences with intelligent defaults
     */
    async getRecipientPreferences(recipient) {
        // Mock enhanced preferences - in production, this would query user settings
        return {
            preferredChannels: ["push", "email", "sms"],
            quietHours: { start: "22:00", end: "08:00", enabled: true },
            language: "en",
            timezone: "Asia/Dubai",
            urgencyThreshold: "medium",
            deliveryOptimization: true,
            fallbackEnabled: true,
        };
    }
    /**
     * Calculate optimal delivery time with advanced logic
     */
    async calculateOptimalDeliveryTime(recipient, priority, scheduledTime) {
        if (priority === "critical") {
            return "immediate";
        }
        if (scheduledTime) {
            return scheduledTime;
        }
        const preferences = await this.getRecipientPreferences(recipient);
        const now = new Date();
        const currentHour = now.getHours();
        // Check quiet hours
        if (preferences.quietHours?.enabled) {
            const quietStart = parseInt(preferences.quietHours.start.split(":")[0]);
            const quietEnd = parseInt(preferences.quietHours.end.split(":")[0]);
            if (currentHour >= quietStart || currentHour < quietEnd) {
                // Schedule for next morning
                const nextMorning = new Date(now);
                nextMorning.setHours(quietEnd, 0, 0, 0);
                if (currentHour >= quietStart) {
                    nextMorning.setDate(nextMorning.getDate() + 1);
                }
                return nextMorning.toISOString();
            }
        }
        return "immediate";
    }
    /**
     * Schedule notification for later delivery
     */
    async scheduleNotification(data) {
        // In production, this would use a job queue (Redis, Bull, etc.)
        const delay = new Date(data.scheduledTime).getTime() - Date.now();
        setTimeout(async () => {
            try {
                await this.sendToChannel(data.userChannel, data.data);
            }
            catch (error) {
                console.error("Failed to send scheduled notification:", error);
            }
        }, Math.max(0, delay));
    }
    /**
     * Try fallback channels when primary channel fails
     */
    async tryFallbackChannels(recipient, failedChannel, data) {
        const fallbackHierarchy = {
            push: ["email", "sms"],
            email: ["sms", "push"],
            sms: ["email", "push"],
            voice: ["sms", "email"],
        };
        const fallbacks = fallbackHierarchy[failedChannel] || [];
        const userChannels = this.userNotificationChannels.get(recipient) || [];
        for (const fallbackType of fallbacks) {
            const fallbackChannel = userChannels.find((ch) => ch.type === fallbackType && ch.enabled);
            if (fallbackChannel) {
                try {
                    await this.sendToChannel(fallbackChannel, {
                        ...data,
                        metadata: {
                            ...data.metadata,
                            fallbackFrom: failedChannel,
                            isFallback: true,
                        },
                    });
                    break; // Success, no need to try more fallbacks
                }
                catch (error) {
                    console.error(`Fallback ${fallbackType} also failed:`, error);
                    continue;
                }
            }
        }
    }
    /**
     * Get comprehensive notification analytics
     */
    async getNotificationAnalytics(timeRange) {
        // Mock analytics - in production, this would query actual data
        return {
            totalNotifications: 2450,
            deliveryRate: 97.2,
            channelPerformance: {
                email: { sent: 890, delivered: 867, failed: 23, rate: 97.4 },
                sms: { sent: 650, delivered: 641, failed: 9, rate: 98.6 },
                push: { sent: 720, delivered: 695, failed: 25, rate: 96.5 },
                voice: { sent: 190, delivered: 178, failed: 12, rate: 93.7 },
            },
            priorityBreakdown: {
                critical: { count: 45, deliveryRate: 100 },
                high: { count: 234, deliveryRate: 98.7 },
                medium: { count: 1456, deliveryRate: 97.1 },
                low: { count: 715, deliveryRate: 96.2 },
            },
            timeAnalysis: {
                peakHours: ["09:00-11:00", "14:00-16:00"],
                averageDeliveryTime: 2.3,
                quietHoursRespected: 94.5,
            },
            userEngagement: {
                openRate: 78.4,
                clickRate: 23.7,
                unsubscribeRate: 0.8,
            },
            failureAnalysis: {
                networkIssues: 45,
                invalidRecipients: 23,
                quotaExceeded: 12,
                serviceUnavailable: 8,
            },
        };
    }
}
// Export singleton instance
export const communicationService = new CommunicationService();
export default communicationService;
