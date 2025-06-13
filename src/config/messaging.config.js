// Messaging and WebSocket Configuration
export const WEBSOCKET_CONFIG = {
    server: process.env.NODE_ENV === "production"
        ? "wss://api.reyada.ae"
        : "ws://localhost:8080",
    path: "/ws",
    pingInterval: 30000, // 30 seconds
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    security: {
        authTimeout: 10000, // 10 seconds
        rateLimiting: {
            enabled: true,
            maxMessagesPerMinute: 200,
        },
    },
};
export const PUBSUB_CHANNELS = {
    // Chat channels
    CHAT_GROUP: (groupId) => `chat_group_${groupId}`,
    CHAT_GLOBAL: "chat_global",
    // Email channels
    EMAIL_NOTIFICATIONS: "email_notifications",
    EMAIL_DELIVERY_STATUS: "email_delivery_status",
    // Committee channels
    COMMITTEE: (committeeId) => `committee_${committeeId}`,
    COMMITTEE_MEETINGS: "committee_meetings",
    // Governance channels
    GOVERNANCE_DOCUMENTS: "governance_documents",
    STAFF_ACKNOWLEDGMENTS: "staff_acknowledgments",
    // System channels
    SYSTEM_ALERTS: "system_alerts",
    DASHBOARD_UPDATES: "dashboard_updates",
};
export const CONNECTION_MANAGEMENT = {
    reconnectStrategy: {
        initialDelay: 1000,
        maxDelay: 30000,
        factor: 2,
        maxAttempts: 10,
        jitter: true,
    },
    heartbeat: {
        interval: 30000,
        timeout: 5000,
    },
};
export const NOTIFICATION_CONFIG = {
    channels: {
        user: "user_{userId}",
        role: "role_{roleId}",
        broadcast: "broadcast",
    },
    types: {
        CHAT_MESSAGE: "chat_message",
        EMAIL_RECEIVED: "email_received",
        COMMITTEE_MEETING: "committee_meeting",
        DOCUMENT_UPDATE: "document_update",
        SYSTEM_ALERT: "system_alert",
    },
    priorities: {
        LOW: "low",
        NORMAL: "normal",
        HIGH: "high",
        URGENT: "urgent",
    },
};
export const MESSAGE_TYPES = {
    // Chat message types
    TEXT: "text",
    FILE: "file",
    VOICE: "voice",
    IMAGE: "image",
    SYSTEM: "system",
    // Email types
    NOTIFICATION: "notification",
    ALERT: "alert",
    REMINDER: "reminder",
    REPORT: "report",
    // Committee types
    MEETING_INVITE: "meeting_invite",
    MEETING_REMINDER: "meeting_reminder",
    ACTION_ITEM: "action_item",
    DECISION: "decision",
};
export const COMMUNICATION_SETTINGS = {
    chat: {
        maxMessageLength: 2000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif"],
        messageRetentionDays: 90,
        maxGroupMembers: 50,
    },
    email: {
        maxSubjectLength: 200,
        maxBodyLength: 10000,
        maxAttachmentSize: 25 * 1024 * 1024, // 25MB
        maxRecipients: 100,
        trackingEnabled: true,
        deliveryTimeout: 300000, // 5 minutes
    },
    committee: {
        maxMeetingDuration: 480, // 8 hours in minutes
        maxAgendaItems: 20,
        maxActionItems: 50,
        meetingReminderHours: [24, 2], // 24 hours and 2 hours before
        actionItemReminderDays: [7, 3, 1], // 7, 3, and 1 day before due date
    },
    governance: {
        maxDocumentSize: 50 * 1024 * 1024, // 50MB
        acknowledgmentTimeoutDays: 30,
        trainingTimeoutDays: 60,
        reviewCycleDays: 365,
        approvalTimeoutDays: 14,
    },
};
export default {
    WEBSOCKET_CONFIG,
    PUBSUB_CHANNELS,
    CONNECTION_MANAGEMENT,
    NOTIFICATION_CONFIG,
    MESSAGE_TYPES,
    COMMUNICATION_SETTINGS,
};
