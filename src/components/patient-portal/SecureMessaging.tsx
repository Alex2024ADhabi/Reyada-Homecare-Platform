import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Plus,
  Archive,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import { SecureMessage, MessageConversation } from "@/types/patient-portal";
import { format, isToday, isYesterday } from "date-fns";
import { useSecureMessaging } from "@/hooks/useSecureMessaging";

interface SecureMessagingProps {
  patientId: string;
  recentMessages: SecureMessage[];
  className?: string;
}

export const SecureMessaging: React.FC<SecureMessagingProps> = ({
  patientId,
  recentMessages,
  className = "",
}) => {
  const [selectedConversation, setSelectedConversation] =
    useState<MessageConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageRecipient, setNewMessageRecipient] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  const {
    conversations,
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    archiveConversation,
    createNewConversation,
  } = useSecureMessaging(patientId);

  const getMessageDateLabel = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) return format(messageDate, "HH:mm");
    if (isYesterday(messageDate)) return "Yesterday";
    return format(messageDate, "MMM dd");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "read":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage,
        priority: "normal",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleCreateNewMessage = async () => {
    if (
      !newMessageSubject.trim() ||
      !newMessage.trim() ||
      !newMessageRecipient
    ) {
      return;
    }

    try {
      await createNewConversation({
        recipientId: newMessageRecipient,
        subject: newMessageSubject,
        content: newMessage,
        priority: "normal",
      });
      setIsComposingNew(false);
      setNewMessage("");
      setNewMessageSubject("");
      setNewMessageRecipient("");
    } catch (error) {
      console.error("Failed to create new message:", error);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600 mt-1">
            Secure communication with your healthcare providers
          </p>
        </div>
        <Dialog open={isComposingNew} onOpenChange={setIsComposingNew}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <Input
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  placeholder="Select healthcare provider..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  placeholder="Enter message subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsComposingNew(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateNewMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="mt-0">
                  <div className="space-y-1">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            if (conversation.unreadCount > 0) {
                              markAsRead(conversation.id);
                            }
                          }}
                          className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={conversation.participants[1]?.avatar}
                              />
                              <AvatarFallback>
                                {conversation.participants[1]?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4
                                  className={`text-sm font-medium truncate ${
                                    conversation.unreadCount > 0
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {conversation.participants[1]?.name}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {conversation.unreadCount > 0 && (
                                    <Badge className="h-5 w-5 flex items-center justify-center text-xs">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {getMessageDateLabel(
                                      conversation.lastMessage.sentAt,
                                    )}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate mt-1">
                                {conversation.subject}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No conversations found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sent" className="mt-0">
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Sent messages will appear here
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="archived" className="mt-0">
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Archived conversations will appear here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={selectedConversation.participants[1]?.avatar}
                      />
                      <AvatarFallback>
                        {selectedConversation.participants[1]?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.participants[1]?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        archiveConversation(selectedConversation.id)
                      }
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "patient"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === "patient"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {message.senderName}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Badge
                              className={getPriorityColor(message.priority)}
                            >
                              {message.priority}
                            </Badge>
                            {getStatusIcon(message.status)}
                          </div>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {format(new Date(message.sentAt), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-2 text-xs"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to view messages and
                  reply.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureMessaging;
