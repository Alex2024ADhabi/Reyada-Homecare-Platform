// Communication & Collaboration Systems Integration Tests
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { communicationAPI } from "@/api/communication.api";
import { getDb, initializeSampleData } from "@/api/mock-db";
import websocketService from "@/services/websocket.service";
import offlineService from "@/services/offline.service";

describe("Communication & Collaboration Systems Integration Tests", () => {
  beforeEach(async () => {
    // Initialize test database with sample data
    await initializeSampleData();
  });

  afterEach(async () => {
    // Clean up after each test
    const db = getDb();
    await db.dropCollection("platform_patient_chat_groups");
    await db.dropCollection("platform_patient_chat_messages");
    await db.dropCollection("email_templates");
    await db.dropCollection("email_communications");
    await db.dropCollection("committees");
    await db.dropCollection("committee_meetings");
    await db.dropCollection("governance_documents");
    await db.dropCollection("staff_acknowledgments");
  });

  describe("Platform Patient Chat Integration", () => {
    it("should create and manage chat groups successfully", async () => {
      const groupData = {
        group_name: "Test Patient Care Team",
        patient_id: "PAT001",
        patient_name: "Test Patient",
        group_type: "patient_care",
        participants: [
          {
            user_id: "EMP001",
            user_name: "Test Nurse",
            role: "Primary Nurse",
            user_type: "staff",
            permissions: ["read", "write"],
            joined_at: new Date().toISOString(),
          },
        ],
        group_settings: {
          allow_file_sharing: true,
          allow_voice_messages: true,
          notification_enabled: true,
          auto_archive_days: 90,
          privacy_level: "restricted",
        },
        created_by: "Test User",
      };

      const createdGroup =
        await communicationAPI.chat.createChatGroup(groupData);
      expect(createdGroup).toBeDefined();
      expect(createdGroup.group_name).toBe(groupData.group_name);
      expect(createdGroup.status).toBe("active");
      expect(createdGroup.group_id).toMatch(/^GRP\d+$/);

      // Test retrieving groups
      const groups = await communicationAPI.chat.getChatGroups();
      expect(groups.length).toBeGreaterThan(0);
      expect(groups.some((g) => g.group_id === createdGroup.group_id)).toBe(
        true,
      );
    });

    it("should handle message sending and reactions", async () => {
      // First create a group
      const group = await communicationAPI.chat.createChatGroup({
        group_name: "Test Group",
        patient_id: "PAT001",
        patient_name: "Test Patient",
        group_type: "patient_care",
        participants: [],
        group_settings: {
          allow_file_sharing: true,
          allow_voice_messages: true,
          notification_enabled: true,
          auto_archive_days: 90,
          privacy_level: "restricted",
        },
        created_by: "Test User",
      });

      // Send a message
      const messageData = {
        group_id: group.group_id,
        sender_id: "EMP001",
        sender_name: "Test Nurse",
        sender_type: "staff",
        message_type: "text",
        content: "Test message content",
        attachments: [],
        priority: "normal",
      };

      const sentMessage = await communicationAPI.chat.sendMessage(messageData);
      expect(sentMessage).toBeDefined();
      expect(sentMessage.content).toBe(messageData.content);
      expect(sentMessage.message_status).toBe("delivered");

      // Add reaction to message
      const reactionResult = await communicationAPI.chat.addReaction(
        sentMessage.message_id,
        "EMP002",
        "thumbs_up",
      );
      expect(reactionResult.success).toBe(true);

      // Mark message as read
      const readResult = await communicationAPI.chat.markMessageAsRead(
        sentMessage.message_id,
        "EMP002",
      );
      expect(readResult.success).toBe(true);

      // Retrieve messages
      const messages = await communicationAPI.chat.getMessages(group.group_id);
      expect(messages.length).toBe(1);
      expect(messages[0].message_id).toBe(sentMessage.message_id);
    });
  });

  describe("Email Workflow Integration", () => {
    it("should create and manage email templates", async () => {
      const templateData = {
        template_name: "Test Care Update Template",
        template_category: "patient_communication",
        subject_template: "Care Update for {{patient_name}}",
        body_template:
          "Dear {{recipient_name}}, here is an update on {{patient_name}}...",
        template_variables: [
          {
            variable_name: "patient_name",
            variable_type: "text",
            required: true,
            description: "Patient full name",
          },
          {
            variable_name: "recipient_name",
            variable_type: "text",
            required: true,
            description: "Recipient name",
          },
        ],
        workflow_triggers: [
          {
            trigger_type: "care_plan_update",
            auto_send: false,
            approval_required: true,
          },
        ],
        template_settings: {
          allow_customization: true,
          require_approval: true,
          track_opens: true,
          track_clicks: true,
          priority: "normal",
        },
        created_by: "Test User",
      };

      const createdTemplate =
        await communicationAPI.email.createEmailTemplate(templateData);
      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.template_name).toBe(templateData.template_name);
      expect(createdTemplate.status).toBe("active");
      expect(createdTemplate.template_id).toMatch(/^TMPL\d+$/);

      // Test retrieving templates
      const templates = await communicationAPI.email.getEmailTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(
        templates.some((t) => t.template_id === createdTemplate.template_id),
      ).toBe(true);
    });

    it("should send emails and track communications", async () => {
      const emailData = {
        template_id: "TMPL001",
        template_name: "Test Template",
        sender: {
          user_id: "EMP001",
          name: "Test Nurse",
          email: "test.nurse@reyada.ae",
          role: "Primary Nurse",
        },
        recipients: [
          {
            recipient_type: "family",
            name: "Test Family Member",
            email: "family@test.com",
            patient_id: "PAT001",
            relationship: "Son",
          },
        ],
        subject: "Test Email Subject",
        body: "Test email body content",
        priority: "normal",
        workflow_context: {
          trigger_type: "manual_send",
          patient_id: "PAT001",
        },
      };

      const sentEmail = await communicationAPI.email.sendEmail(emailData);
      expect(sentEmail).toBeDefined();
      expect(sentEmail.subject).toBe(emailData.subject);
      expect(sentEmail.status).toBe("sent");
      expect(sentEmail.communication_id).toMatch(/^COMM\d+$/);
      expect(sentEmail.delivery_status.delivered).toBe(1);

      // Test retrieving communications
      const communications =
        await communicationAPI.email.getEmailCommunications();
      expect(communications.length).toBeGreaterThan(0);
      expect(
        communications.some(
          (c) => c.communication_id === sentEmail.communication_id,
        ),
      ).toBe(true);
    });
  });

  describe("Committee Management Integration", () => {
    it("should create and manage committees", async () => {
      const committeeData = {
        committee_name: "Test Quality Committee",
        committee_type: "quality_management",
        description: "Test committee for quality management",
        purpose: "Ensure quality standards are met",
        scope: "Organization-wide quality initiatives",
        authority_level: "advisory",
        reporting_to: "Executive Committee",
        meeting_frequency: "monthly",
        members: [
          {
            member_id: "EMP001",
            name: "Test Chair",
            role: "Quality Manager",
            committee_role: "Chairperson",
            department: "Quality Assurance",
            joined_date: new Date().toISOString(),
            status: "active",
            voting_rights: true,
          },
        ],
        responsibilities: [
          "Review quality metrics",
          "Approve quality initiatives",
          "Monitor compliance",
        ],
        meeting_schedule: {
          day_of_month: 15,
          time: "14:00",
          duration_minutes: 120,
          location: "Conference Room A",
          virtual_option: true,
        },
        created_by: "Test User",
      };

      const createdCommittee =
        await communicationAPI.committee.createCommittee(committeeData);
      expect(createdCommittee).toBeDefined();
      expect(createdCommittee.committee_name).toBe(
        committeeData.committee_name,
      );
      expect(createdCommittee.status).toBe("active");
      expect(createdCommittee.committee_id).toMatch(/^COMM\d+$/);

      // Test retrieving committees
      const committees = await communicationAPI.committee.getCommittees();
      expect(committees.length).toBeGreaterThan(0);
      expect(
        committees.some(
          (c) => c.committee_id === createdCommittee.committee_id,
        ),
      ).toBe(true);
    });

    it("should schedule and manage meetings", async () => {
      const meetingData = {
        committee_id: "COMM001",
        committee_name: "Test Committee",
        meeting_title: "Monthly Quality Review",
        meeting_type: "regular",
        meeting_date: "2024-02-15",
        meeting_time: "14:00",
        duration_minutes: 120,
        location: "Conference Room A",
        meeting_format: "hybrid",
        chairperson: {
          member_id: "EMP001",
          name: "Test Chair",
          role: "Quality Manager",
        },
        secretary: {
          member_id: "EMP002",
          name: "Test Secretary",
          role: "Administrative Assistant",
        },
        attendees: [],
        agenda_items: [
          {
            item_id: "AGD001",
            item_number: 1,
            title: "Review Quality Metrics",
            description: "Monthly quality metrics review",
            presenter: "Quality Manager",
            time_allocated: 30,
            item_type: "presentation",
            supporting_documents: [],
          },
        ],
        decisions_made: [],
        action_items: [],
        meeting_notes: "",
        next_meeting: {
          scheduled_date: "2024-03-15",
          scheduled_time: "14:00",
          location: "Conference Room A",
        },
        minutes_approved: false,
        created_by: "Test User",
      };

      const scheduledMeeting =
        await communicationAPI.committee.scheduleMeeting(meetingData);
      expect(scheduledMeeting).toBeDefined();
      expect(scheduledMeeting.meeting_title).toBe(meetingData.meeting_title);
      expect(scheduledMeeting.meeting_status).toBe("scheduled");
      expect(scheduledMeeting.meeting_id).toMatch(/^MEET\d+$/);

      // Test retrieving meetings
      const meetings = await communicationAPI.committee.getMeetings();
      expect(meetings.length).toBeGreaterThan(0);
      expect(
        meetings.some((m) => m.meeting_id === scheduledMeeting.meeting_id),
      ).toBe(true);
    });
  });

  describe("Governance Document Integration", () => {
    it("should create and manage governance documents", async () => {
      const documentData = {
        document_title: "Test Patient Safety Policy",
        document_type: "policy",
        document_category: "patient_safety",
        document_content: "This is the content of the test policy document...",
        document_summary: "Test policy for patient safety procedures",
        acknowledgment_required: true,
        target_audience: ["nursing_staff", "medical_staff"],
        training_required: true,
        compliance_requirements: ["DOH_compliance", "JAWDA_standards"],
        review_frequency: "annual",
        created_by: "Test User",
      };

      const createdDocument =
        await communicationAPI.governance.createDocument(documentData);
      expect(createdDocument).toBeDefined();
      expect(createdDocument.document_title).toBe(documentData.document_title);
      expect(createdDocument.document_status).toBe("draft");
      expect(createdDocument.document_id).toMatch(/^DOC\d+$/);

      // Test document approval
      const approvalResult = await communicationAPI.governance.approveDocument(
        createdDocument.document_id,
        {
          approver_name: "Test Approver",
          approver_role: "Quality Manager",
        },
      );
      expect(approvalResult.success).toBe(true);

      // Test retrieving documents
      const documents = await communicationAPI.governance.getDocuments();
      expect(documents.length).toBeGreaterThan(0);
      expect(
        documents.some((d) => d.document_id === createdDocument.document_id),
      ).toBe(true);
    });

    it("should manage staff acknowledgments", async () => {
      // Test completing acknowledgment
      const acknowledgmentDetails = {
        read_confirmation: true,
        understanding_confirmation: true,
        compliance_commitment: true,
        questions_or_concerns: "None",
        additional_comments: "Document reviewed and understood",
      };

      const completionResult =
        await communicationAPI.governance.completeAcknowledgment(
          "ACK001",
          acknowledgmentDetails,
        );
      expect(completionResult.success).toBe(true);

      // Test sending reminder
      const reminderResult =
        await communicationAPI.governance.sendAcknowledgmentReminder(
          "ACK002",
          "email",
        );
      expect(reminderResult.success).toBe(true);

      // Test retrieving acknowledgments
      const acknowledgments =
        await communicationAPI.governance.getAcknowledgments();
      expect(acknowledgments.length).toBeGreaterThan(0);
    });
  });

  describe("Communication Dashboard Integration", () => {
    it("should provide comprehensive dashboard metrics", async () => {
      const dashboardData =
        await communicationAPI.dashboard.getCommunicationDashboard();

      expect(dashboardData).toBeDefined();
      expect(dashboardData.metrics).toBeDefined();
      expect(dashboardData.alerts).toBeDefined();
      expect(dashboardData.trends).toBeDefined();

      // Test metrics structure
      const { metrics } = dashboardData;
      expect(metrics.chat_groups).toBeDefined();
      expect(metrics.email_communications).toBeDefined();
      expect(metrics.committee_activities).toBeDefined();
      expect(metrics.governance_documents).toBeDefined();

      // Test specific metric values
      expect(typeof metrics.chat_groups.total_active_groups).toBe("number");
      expect(typeof metrics.email_communications.open_rate_percentage).toBe(
        "number",
      );
      expect(typeof metrics.committee_activities.active_committees).toBe(
        "number",
      );
      expect(
        typeof metrics.governance_documents.compliance_rate_percentage,
      ).toBe("number");

      // Test alerts structure
      expect(Array.isArray(dashboardData.alerts)).toBe(true);
      if (dashboardData.alerts.length > 0) {
        const alert = dashboardData.alerts[0];
        expect(alert.alert_id).toBeDefined();
        expect(alert.alert_type).toBeDefined();
        expect(alert.severity).toBeDefined();
        expect(alert.message).toBeDefined();
      }

      // Test trends structure
      const { trends } = dashboardData;
      expect(trends.communication_volume).toBeDefined();
      expect(trends.email_engagement).toBeDefined();
      expect(trends.committee_efficiency).toBeDefined();
      expect(Array.isArray(trends.communication_volume.last_7_days)).toBe(true);
    });
  });

  describe("WebSocket Integration", () => {
    it("should handle real-time communication", async () => {
      // Test WebSocket connection
      expect(websocketService.isConnected).toBeDefined();

      // Test subscription to channels
      const unsubscribe = websocketService.subscribe("chat_global", (data) => {
        expect(data).toBeDefined();
      });

      expect(typeof unsubscribe).toBe("function");

      // Test publishing messages
      websocketService.publish("chat_global", {
        type: "test_message",
        data: { message: "Test WebSocket message" },
      });

      // Clean up subscription
      unsubscribe();
    });
  });

  describe("Offline Integration", () => {
    it("should handle offline data synchronization", async () => {
      // Test saving communication data offline
      const chatGroupData = {
        group_name: "Offline Test Group",
        patient_id: "PAT001",
        group_type: "patient_care",
        priority: "high",
      };

      const savedId = await offlineService.saveAdministrativeData(
        "chatGroups",
        chatGroupData,
      );
      expect(savedId).toBeDefined();

      // Test retrieving offline data
      const offlineData =
        await offlineService.getAdministrativeData("chatGroups");
      expect(Array.isArray(offlineData)).toBe(true);
      expect(offlineData.some((item) => item.id === savedId)).toBe(true);

      // Test sync status update
      await offlineService.updateAdministrativeDataStatus(
        "chatGroups",
        savedId,
        "synced",
      );

      // Test compliance summary
      const complianceSummary =
        await offlineService.getOfflineComplianceSummary();
      expect(complianceSummary).toBeDefined();
      expect(typeof complianceSummary.total_items).toBe("number");
      expect(typeof complianceSummary.doh_reportable).toBe("number");
      expect(typeof complianceSummary.compliance_score_impact).toBe(
        "undefined",
      ); // This property doesn't exist in the return type
    });
  });

  describe("Data Integrity and Validation", () => {
    it("should validate data integrity across all systems", async () => {
      // Test chat group data integrity
      const groups = await communicationAPI.chat.getChatGroups();
      groups.forEach((group) => {
        expect(group.group_id).toBeDefined();
        expect(group.group_name).toBeDefined();
        expect(group.status).toBeDefined();
        expect(group.created_at).toBeDefined();
      });

      // Test email template data integrity
      const templates = await communicationAPI.email.getEmailTemplates();
      templates.forEach((template) => {
        expect(template.template_id).toBeDefined();
        expect(template.template_name).toBeDefined();
        expect(template.status).toBeDefined();
        expect(template.created_at).toBeDefined();
      });

      // Test committee data integrity
      const committees = await communicationAPI.committee.getCommittees();
      committees.forEach((committee) => {
        expect(committee.committee_id).toBeDefined();
        expect(committee.committee_name).toBeDefined();
        expect(committee.status).toBeDefined();
        expect(committee.created_at).toBeDefined();
      });

      // Test governance document data integrity
      const documents = await communicationAPI.governance.getDocuments();
      documents.forEach((document) => {
        expect(document.document_id).toBeDefined();
        expect(document.document_title).toBeDefined();
        expect(document.document_status).toBeDefined();
        expect(document.created_at).toBeDefined();
      });
    });
  });

  describe("Performance and Load Testing", () => {
    it("should handle concurrent operations efficiently", async () => {
      const startTime = Date.now();

      // Create multiple operations concurrently
      const operations = [
        communicationAPI.chat.getChatGroups(),
        communicationAPI.email.getEmailTemplates(),
        communicationAPI.committee.getCommittees(),
        communicationAPI.governance.getDocuments(),
        communicationAPI.dashboard.getCommunicationDashboard(),
      ];

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verify all operations completed successfully
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });

      // Performance should be reasonable (under 5 seconds for mock operations)
      expect(executionTime).toBeLessThan(5000);
    });

    it("should handle large datasets efficiently", async () => {
      // Create multiple chat groups to test performance
      const createPromises = [];
      for (let i = 0; i < 10; i++) {
        createPromises.push(
          communicationAPI.chat.createChatGroup({
            group_name: `Performance Test Group ${i}`,
            patient_id: `PAT${i.toString().padStart(3, "0")}`,
            patient_name: `Test Patient ${i}`,
            group_type: "patient_care",
            participants: [],
            group_settings: {
              allow_file_sharing: true,
              allow_voice_messages: true,
              notification_enabled: true,
              auto_archive_days: 90,
              privacy_level: "restricted",
            },
            created_by: "Performance Test",
          }),
        );
      }

      const startTime = Date.now();
      const createdGroups = await Promise.all(createPromises);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(createdGroups).toHaveLength(10);
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds

      // Test retrieval performance
      const retrievalStartTime = Date.now();
      const allGroups = await communicationAPI.chat.getChatGroups();
      const retrievalEndTime = Date.now();
      const retrievalTime = retrievalEndTime - retrievalStartTime;

      expect(allGroups.length).toBeGreaterThanOrEqual(10);
      expect(retrievalTime).toBeLessThan(1000); // Should retrieve within 1 second
    });
  });
});
