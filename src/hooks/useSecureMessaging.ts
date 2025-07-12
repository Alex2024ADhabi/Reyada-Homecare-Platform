import { useState, useEffect } from "react";
import { SecureMessage, MessageConversation } from "@/types/patient-portal";

interface UseSecureMessagingReturn {
  conversations: MessageConversation[];
  messages: SecureMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (messageData: {
    conversationId: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    attachments?: File[];
  }) => Promise<void>;
  createNewConversation: (conversationData: {
    recipientId: string;
    subject: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
}

export const useSecureMessaging = (
  patientId: string,
): UseSecureMessagingReturn => {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [patientId]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockConversations: MessageConversation[] = [
        {
          id: "conv-1",
          participants: [
            {
              id: patientId,
              name: "Ahmed Al-Mansouri",
              type: "patient",
            },
            {
              id: "provider-1",
              name: "Dr. Sarah Johnson",
              type: "provider",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
            },
          ],
          subject: "Medication Questions",
          lastMessage: {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "provider-1",
            senderName: "Dr. Sarah Johnson",
            senderType: "provider",
            recipientId: patientId,
            recipientName: "Ahmed Al-Mansouri",
            recipientType: "patient",
            subject: "Medication Questions",
            content:
              "Please remember to take your evening medication and record your blood sugar levels.",
            priority: "normal",
            status: "delivered",
            sentAt: "2024-01-18T18:00:00Z",
          },
          unreadCount: 1,
          status: "active",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-18T18:00:00Z",
        },
        {
          id: "conv-2",
          participants: [
            {
              id: patientId,
              name: "Ahmed Al-Mansouri",
              type: "patient",
            },
            {
              id: "provider-2",
              name: "Nurse Lisa",
              type: "provider",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
            },
          ],
          subject: "Appointment Confirmation",
          lastMessage: {
            id: "msg-2",
            conversationId: "conv-2",
            senderId: patientId,
            senderName: "Ahmed Al-Mansouri",
            senderType: "patient",
            recipientId: "provider-2",
            recipientName: "Nurse Lisa",
            recipientType: "provider",
            subject: "Appointment Confirmation",
            content:
              "Thank you for confirming my appointment. I'll be ready at 10 AM.",
            priority: "normal",
            status: "read",
            sentAt: "2024-01-17T14:30:00Z",
            readAt: "2024-01-17T14:35:00Z",
          },
          unreadCount: 0,
          status: "active",
          createdAt: "2024-01-16T09:00:00Z",
          updatedAt: "2024-01-17T14:30:00Z",
        },
      ];
      setConversations(mockConversations);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockMessages: SecureMessage[] = [
        {
          id: "msg-1",
          conversationId,
          senderId: "provider-1",
          senderName: "Dr. Sarah Johnson",
          senderType: "provider",
          recipientId: patientId,
          recipientName: "Ahmed Al-Mansouri",
          recipientType: "patient",
          subject: "Medication Questions",
          content:
            "Hello Ahmed, I hope you're doing well. I wanted to check in about your medication routine.",
          priority: "normal",
          status: "read",
          sentAt: "2024-01-17T10:00:00Z",
          readAt: "2024-01-17T10:15:00Z",
        },
        {
          id: "msg-2",
          conversationId,
          senderId: patientId,
          senderName: "Ahmed Al-Mansouri",
          senderType: "patient",
          recipientId: "provider-1",
          recipientName: "Dr. Sarah Johnson",
          recipientType: "provider",
          subject: "Medication Questions",
          content:
            "Hi Dr. Johnson, I've been taking my medication as prescribed. I have a question about the timing though.",
          priority: "normal",
          status: "read",
          sentAt: "2024-01-17T10:30:00Z",
          readAt: "2024-01-17T11:00:00Z",
        },
        {
          id: "msg-3",
          conversationId,
          senderId: "provider-1",
          senderName: "Dr. Sarah Johnson",
          senderType: "provider",
          recipientId: patientId,
          recipientName: "Ahmed Al-Mansouri",
          recipientType: "patient",
          subject: "Medication Questions",
          content:
            "Please remember to take your evening medication and record your blood sugar levels. Let me know if you have any concerns.",
          priority: "normal",
          status: "delivered",
          sentAt: "2024-01-18T18:00:00Z",
        },
      ];
      setMessages(mockMessages);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageData: {
    conversationId: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    attachments?: File[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("conversationId", messageData.conversationId);
      formData.append("content", messageData.content);
      formData.append("priority", messageData.priority);
      formData.append("senderId", patientId);

      if (messageData.attachments) {
        messageData.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      // TODO: Replace with actual API call
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === messageData.conversationId
            ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.sentAt }
            : conv,
        ),
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (conversationData: {
    recipientId: string;
    subject: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({
          ...conversationData,
          senderId: patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      setConversations((prev) => [newConversation, ...prev]);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/conversations/${conversationId}/archive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, status: "archived" } : conv,
        ),
      );
    } catch (err) {
      console.error("Failed to archive conversation:", err);
      throw err;
    }
  };

  return {
    conversations,
    messages,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    markAsRead,
    archiveConversation,
    loadMessages,
  };
};
