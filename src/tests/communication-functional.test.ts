// Communication & Collaboration Systems Functional Tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommunicationDashboard from '@/components/administrative/CommunicationDashboard';
import PlatformPatientChat from '@/components/administrative/PlatformPatientChat';
import EmailWorkflowManager from '@/components/administrative/EmailWorkflowManager';
import CommitteeManagement from '@/components/administrative/CommitteeManagement';
import GovernanceDocuments from '@/components/administrative/GovernanceDocuments';
import { communicationAPI } from '@/api/communication.api';
import { initializeSampleData } from '@/api/mock-db';

// Mock the API
vi.mock('@/api/communication.api');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Communication Dashboard Functional Tests', () => {
  beforeEach(async () => {
    await initializeSampleData();
    
    // Mock API responses
    vi.mocked(communicationAPI.dashboard.getCommunicationDashboard).mockResolvedValue({
      metrics: {
        chat_groups: {
          total_active_groups: 15,
          new_groups_today: 2,
          messages_sent_today: 47,
          average_response_time_minutes: 12,
          most_active_group: 'Patient Care Team Alpha',
        },
        email_communications: {
          emails_sent_today: 8,
          emails_delivered: 8,
          emails_opened: 6,
          open_rate_percentage: 75,
          click_rate_percentage: 19,
          bounce_rate_percentage: 2,
        },
        committee_activities: {
          active_committees: 5,
          meetings_this_month: 8,
          pending_action_items: 15,
          overdue_action_items: 3,
          upcoming_meetings_next_7_days: 2,
        },
        governance_documents: {
          total_documents: 45,
          pending_acknowledgments: 8,
          documents_updated_this_week: 3,
          compliance_rate_percentage: 94,
        },
      },
      alerts: [
        {
          alert_id: 'ALERT001',
          alert_type: 'overdue_acknowledgment',
          severity: 'medium',
          message: '3 staff acknowledgments are overdue',
          details: 'Patient Communication Policy acknowledgments pending',
          created_at: new Date().toISOString(),
        },
      ],
      trends: {
        communication_volume: {
          last_7_days: [45, 52, 38, 61, 47, 55, 49],
          trend_direction: 'stable',
          percentage_change: 2.3,
        },
        email_engagement: {
          last_30_days_open_rate: Array.from({length: 30}, () => Math.floor(Math.random() * 20) + 70),
          trend_direction: 'increasing',
          percentage_change: 5.7,
        },
        committee_efficiency: {
          action_item_completion_rate: [85, 87, 82, 89, 91],
          trend_direction: 'increasing',
          percentage_change: 7.1,
        },
      },
    });
  });

  it('should display dashboard metrics correctly', async () => {
    renderWithRouter(<CommunicationDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Communication Dashboard')).toBeInTheDocument();
    });

    // Check if key metrics are displayed
    expect(screen.getByText('15')).toBeInTheDocument(); // Active Chat Groups
    expect(screen.getByText('47')).toBeInTheDocument(); // Messages Today
    expect(screen.getByText('75%')).toBeInTheDocument(); // Email Open Rate
    expect(screen.getByText('15')).toBeInTheDocument(); // Pending Actions
  });

  it('should handle tab navigation', async () => {
    renderWithRouter(<CommunicationDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Communication Dashboard')).toBeInTheDocument();
    });

    // Test tab switching
    const chatTab = screen.getByText('Chat Activity');
    fireEvent.click(chatTab);
    
    await waitFor(() => {
      expect(screen.getByText('Chat Group Performance')).toBeInTheDocument();
    });

    const emailTab = screen.getByText('Email Performance');
    fireEvent.click(emailTab);
    
    await waitFor(() => {
      expect(screen.getByText('Email Metrics')).toBeInTheDocument();
    });
  });

  it('should display alerts when present', async () => {
    renderWithRouter(<CommunicationDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      expect(screen.getByText('3 staff acknowledgments are overdue')).toBeInTheDocument();
    });
  });

  it('should refresh data when refresh button is clicked', async () => {
    renderWithRouter(<CommunicationDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Communication Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Verify API was called again
    await waitFor(() => {
      expect(communicationAPI.dashboard.getCommunicationDashboard).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Platform Patient Chat Functional Tests', () => {
  beforeEach(() => {
    vi.mocked(communicationAPI.chat.getChatGroups).mockResolvedValue([
      {
        _id: '1',
        group_id: 'GRP001',
        group_name: 'Ahmed Al Mansouri - Care Team',
        patient_id: 'PAT001',
        patient_name: 'Ahmed Al Mansouri',
        group_type: 'patient_care',
        participants: [
          {
            user_id: 'EMP001',
            user_name: 'Nurse Fatima Al Zahra',
            role: 'Primary Nurse',
            user_type: 'staff',
            permissions: ['read', 'write', 'admin'],
            joined_at: '2024-01-15T08:00:00Z',
          },
        ],
        group_settings: {
          allow_file_sharing: true,
          allow_voice_messages: true,
          notification_enabled: true,
          auto_archive_days: 90,
          privacy_level: 'restricted',
        },
        status: 'active',
        created_by: 'Nurse Fatima Al Zahra',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-18T14:30:00Z',
      },
    ]);

    vi.mocked(communicationAPI.chat.getMessages).mockResolvedValue([
      {
        _id: '1',
        message_id: 'MSG001',
        group_id: 'GRP001',
        sender_id: 'EMP001',
        sender_name: 'Nurse Fatima Al Zahra',
        sender_type: 'staff',
        message_type: 'text',
        content: 'Good morning! Patient is doing well today.',
        attachments: [],
        reply_to_message_id: null,
        message_status: 'delivered',
        read_by: [],
        reactions: [],
        priority: 'normal',
        created_at: '2024-01-18T08:00:00Z',
        updated_at: '2024-01-18T08:00:00Z',
      },
    ]);
  });

  it('should display chat groups and allow selection', async () => {
    renderWithRouter(<PlatformPatientChat />);
    
    await waitFor(() => {
      expect(screen.getByText('Patient Chat')).toBeInTheDocument();
      expect(screen.getByText('Ahmed Al Mansouri - Care Team')).toBeInTheDocument();
    });

    // Click on a chat group
    const chatGroup = screen.getByText('Ahmed Al Mansouri - Care Team');
    fireEvent.click(chatGroup);
    
    await waitFor(() => {
      expect(communicationAPI.chat.getMessages).toHaveBeenCalledWith('GRP001');
    });
  });

  it('should allow sending messages', async () => {
    vi.mocked(communicationAPI.chat.sendMessage).mockResolvedValue({
      _id: '2',
      message_id: 'MSG002',
      group_id: 'GRP001',
      sender_id: 'EMP001',
      sender_name: 'Test User',
      sender_type: 'staff',
      message_type: 'text',
      content: 'Test message',
      attachments: [],
      message_status: 'delivered',
      read_by: [],
      reactions: [],
      priority: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithRouter(<PlatformPatientChat />);
    
    await waitFor(() => {
      expect(screen.getByText('Ahmed Al Mansouri - Care Team')).toBeInTheDocument();
    });

    // Select a chat group first
    const chatGroup = screen.getByText('Ahmed Al Mansouri - Care Team');
    fireEvent.click(chatGroup);
    
    await waitFor(() => {
      const messageInput = screen.getByPlaceholderText('Type your message...');
      expect(messageInput).toBeInTheDocument();
      
      // Type a message
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      
      // Send the message
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(communicationAPI.chat.sendMessage).toHaveBeenCalled();
    });
  });

  it('should allow creating new chat groups', async () => {
    vi.mocked(communicationAPI.chat.createChatGroup).mockResolvedValue({
      _id: '2',
      group_id: 'GRP002',
      group_name: 'New Test Group',
      patient_id: 'PAT002',
      patient_name: 'Test Patient',
      group_type: 'patient_care',
      participants: [],
      group_settings: {
        allow_file_sharing: true,
        allow_voice_messages: true,
        notification_enabled: true,
        auto_archive_days: 90,
        privacy_level: 'restricted',
      },
      status: 'active',
      created_by: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithRouter(<PlatformPatientChat />);
    
    await waitFor(() => {
      const newGroupButton = screen.getByRole('button', { name: /\+/i });
      fireEvent.click(newGroupButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create New Chat Group')).toBeInTheDocument();
      
      // Fill in the form
      const groupNameInput = screen.getByLabelText('Group Name');
      fireEvent.change(groupNameInput, { target: { value: 'New Test Group' } });
      
      const patientNameInput = screen.getByLabelText('Patient Name');
      fireEvent.change(patientNameInput, { target: { value: 'Test Patient' } });
      
      const patientIdInput = screen.getByLabelText('Patient ID');
      fireEvent.change(patientIdInput, { target: { value: 'PAT002' } });
      
      // Submit the form
      const createButton = screen.getByText('Create Group');
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(communicationAPI.chat.createChatGroup).toHaveBeenCalled();
    });
  });
});

describe('Email Workflow Manager Functional Tests', () => {
  beforeEach(() => {
    vi.mocked(communicationAPI.email.getEmailTemplates).mockResolvedValue([
      {
        _id: '1',
        template_id: 'TMPL001',
        template_name: 'Care Plan Update Notification',
        template_category: 'patient_communication',
        subject_template: 'Care Plan Update for {{patient_name}}',
        body_template: 'Dear {{recipient_name}}, here is an update...',
        template_variables: [
          {
            variable_name: 'patient_name',
            variable_type: 'text',
            required: true,
            description: 'Patient full name',
          },
        ],
        workflow_triggers: [],
        template_settings: {
          allow_customization: true,
          require_approval: true,
          track_opens: true,
          track_clicks: true,
          priority: 'normal',
        },
        status: 'active',
        created_by: 'Test User',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
      },
    ]);

    vi.mocked(communicationAPI.email.getEmailCommunications).mockResolvedValue([]);
  });

  it('should display email templates', async () => {
    renderWithRouter(<EmailWorkflowManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Email Workflow Manager')).toBeInTheDocument();
      expect(screen.getByText('Care Plan Update Notification')).toBeInTheDocument();
    });
  });

  it('should allow creating new email templates', async () => {
    vi.mocked(communicationAPI.email.createEmailTemplate).mockResolvedValue({
      _id: '2',
      template_id: 'TMPL002',
      template_name: 'New Test Template',
      template_category: 'patient_communication',
      subject_template: 'Test Subject',
      body_template: 'Test Body',
      template_variables: [],
      workflow_triggers: [],
      template_settings: {
        allow_customization: true,
        require_approval: false,
        track_opens: true,
        track_clicks: true,
        priority: 'normal',
      },
      status: 'active',
      created_by: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithRouter(<EmailWorkflowManager />);
    
    await waitFor(() => {
      const newTemplateButton = screen.getByText('New Template');
      fireEvent.click(newTemplateButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create Email Template')).toBeInTheDocument();
      
      // Fill in the form
      const templateNameInput = screen.getByLabelText('Template Name');
      fireEvent.change(templateNameInput, { target: { value: 'New Test Template' } });
      
      const subjectInput = screen.getByLabelText('Subject Template');
      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      
      const bodyInput = screen.getByLabelText('Body Template');
      fireEvent.change(bodyInput, { target: { value: 'Test Body' } });
      
      // Submit the form
      const createButton = screen.getByText('Create Template');
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(communicationAPI.email.createEmailTemplate).toHaveBeenCalled();
    });
  });
});

describe('Committee Management Functional Tests', () => {
  beforeEach(() => {
    vi.mocked(communicationAPI.committee.getCommittees).mockResolvedValue([
      {
        _id: '1',
        committee_id: 'COMM001',
        committee_name: 'Quality Assurance Committee',
        committee_type: 'quality_management',
        description: 'Oversees quality improvement initiatives',
        purpose: 'Ensure quality standards',
        scope: 'Organization-wide',
        authority_level: 'operational',
        reporting_to: 'Executive Committee',
        meeting_frequency: 'monthly',
        members: [
          {
            member_id: 'EMP001',
            name: 'Dr. Quality Manager',
            role: 'Committee Chair',
            committee_role: 'Chairperson',
            department: 'Quality Assurance',
            joined_date: '2024-01-01',
            status: 'active',
            voting_rights: true,
          },
        ],
        responsibilities: ['Review quality metrics', 'Approve initiatives'],
        meeting_schedule: {
          day_of_month: 15,
          time: '14:00',
          duration_minutes: 120,
          location: 'Conference Room A',
          virtual_option: true,
        },
        status: 'active',
        created_by: 'Test User',
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]);

    vi.mocked(communicationAPI.committee.getMeetings).mockResolvedValue([]);
  });

  it('should display committees', async () => {
    renderWithRouter(<CommitteeManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Committee Management')).toBeInTheDocument();
      expect(screen.getByText('Quality Assurance Committee')).toBeInTheDocument();
    });
  });

  it('should allow creating new committees', async () => {
    vi.mocked(communicationAPI.committee.createCommittee).mockResolvedValue({
      _id: '2',
      committee_id: 'COMM002',
      committee_name: 'New Test Committee',
      committee_type: 'quality_management',
      description: 'Test committee',
      purpose: 'Testing purposes',
      scope: 'Test scope',
      authority_level: 'advisory',
      reporting_to: 'Test Committee',
      meeting_frequency: 'monthly',
      members: [],
      responsibilities: [],
      meeting_schedule: {
        day_of_month: 15,
        time: '14:00',
        duration_minutes: 120,
        location: 'Conference Room A',
        virtual_option: true,
      },
      status: 'active',
      created_by: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithRouter(<CommitteeManagement />);
    
    await waitFor(() => {
      const newCommitteeButton = screen.getByText('New Committee');
      fireEvent.click(newCommitteeButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create New Committee')).toBeInTheDocument();
      
      // Fill in the form
      const committeeNameInput = screen.getByLabelText('Committee Name');
      fireEvent.change(committeeNameInput, { target: { value: 'New Test Committee' } });
      
      const descriptionInput = screen.getByLabelText('Description');
      fireEvent.change(descriptionInput, { target: { value: 'Test committee' } });
      
      const purposeInput = screen.getByLabelText('Purpose');
      fireEvent.change(purposeInput, { target: { value: 'Testing purposes' } });
      
      // Submit the form
      const createButton = screen.getByText('Create Committee');
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(communicationAPI.committee.createCommittee).toHaveBeenCalled();
    });
  });
});

describe('Governance Documents Functional Tests', () => {
  beforeEach(() => {
    vi.mocked(communicationAPI.governance.getDocuments).mockResolvedValue([
      {
        _id: '1',
        document_id: 'DOC001',
        document_title: 'Patient Communication Policy',
        document_type: 'policy',
        document_category: 'patient_care',
        version: '2.1',
        effective_date: '2024-01-10',
        expiry_date: '2025-01-10',
        document_content: 'Policy content...',
        document_summary: 'Comprehensive policy for patient communication',
        approval_workflow: {
          required_approvers: [],
          final_approval_status: 'approved',
          final_approved_by: 'Executive Director',
          final_approved_date: '2024-01-10T16:00:00Z',
        },
        acknowledgment_required: true,
        target_audience: ['nursing_staff'],
        acknowledgment_deadline: '2024-01-25',
        training_required: true,
        training_deadline: '2024-02-10',
        related_documents: [],
        compliance_requirements: [],
        review_schedule: {
          review_frequency: 'annual',
          next_review_date: '2024-07-10',
          review_responsible: 'Quality Assurance Committee',
        },
        document_status: 'active',
        created_by: 'Test User',
        created_at: '2024-01-05T09:00:00Z',
        updated_at: '2024-01-10T16:00:00Z',
      },
    ]);

    vi.mocked(communicationAPI.governance.getAcknowledgments).mockResolvedValue([]);
  });

  it('should display governance documents', async () => {
    renderWithRouter(<GovernanceDocuments />);
    
    await waitFor(() => {
      expect(screen.getByText('Governance & Document Management')).toBeInTheDocument();
      expect(screen.getByText('Patient Communication Policy')).toBeInTheDocument();
    });
  });

  it('should allow creating new documents', async () => {
    vi.mocked(communicationAPI.governance.createDocument).mockResolvedValue({
      _id: '2',
      document_id: 'DOC002',
      document_title: 'New Test Policy',
      document_type: 'policy',
      document_category: 'patient_care',
      version: '1.0',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      document_content: 'Test policy content',
      document_summary: 'Test policy summary',
      approval_workflow: {
        required_approvers: [],
        final_approval_status: 'pending',
      },
      acknowledgment_required: true,
      target_audience: [],
      training_required: false,
      related_documents: [],
      compliance_requirements: [],
      review_schedule: {
        review_frequency: 'annual',
        next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        review_responsible: 'Quality Assurance Committee',
      },
      document_status: 'draft',
      created_by: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithRouter(<GovernanceDocuments />);
    
    await waitFor(() => {
      const newDocumentButton = screen.getByText('New Document');
      fireEvent.click(newDocumentButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
      
      // Fill in the form
      const documentTitleInput = screen.getByLabelText('Document Title');
      fireEvent.change(documentTitleInput, { target: { value: 'New Test Policy' } });
      
      const summaryInput = screen.getByLabelText('Document Summary');
      fireEvent.change(summaryInput, { target: { value: 'Test policy summary' } });
      
      const contentInput = screen.getByLabelText('Document Content');
      fireEvent.change(contentInput, { target: { value: 'Test policy content' } });
      
      // Submit the form
      const createButton = screen.getByText('Create Document');
      fireEvent.click(createButton);
    });
    
    await waitFor(() => {
      expect(communicationAPI.governance.createDocument).toHaveBeenCalled();
    });
  });

  it('should handle document filtering', async () => {
    renderWithRouter(<GovernanceDocuments />);
    
    await waitFor(() => {
      expect(screen.getByText('Patient Communication Policy')).toBeInTheDocument();
    });

    // Test search functionality
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Communication' } });
    
    await waitFor(() => {
      expect(screen.getByText('Patient Communication Policy')).toBeInTheDocument();
    });

    // Test filter functionality
    const filterSelect = screen.getByRole('combobox');
    fireEvent.click(filterSelect);
    
    await waitFor(() => {
      const policyOption = screen.getByText('Policies');
      fireEvent.click(policyOption);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Patient Communication Policy')).toBeInTheDocument();
    });
  });
});
