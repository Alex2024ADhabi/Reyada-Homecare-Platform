import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MessageCircle,
  Users,
  Plus,
  Send,
  Paperclip,
  Mic,
  Search,
  Settings,
  UserPlus,
  Phone,
  Video,
  MoreVertical,
  ThumbsUp,
  Heart,
  Smile,
} from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import websocketService from "@/services/websocket.service";

interface ChatGroup {
  _id: string;
  group_id: string;
  group_name: string;
  patient_id: string;
  patient_name: string;
  group_type: string;
  participants: Array<{
    user_id: string;
    user_name: string;
    role: string;
    user_type: string;
    permissions: string[];
    joined_at: string;
  }>;
  group_settings: {
    allow_file_sharing: boolean;
    allow_voice_messages: boolean;
    notification_enabled: boolean;
    auto_archive_days: number;
    privacy_level: string;
  };
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  _id: string;
  message_id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  message_type: string;
  content: string;
  attachments: Array<{
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
  }>;
  reply_to_message_id?: string;
  message_status: string;
  read_by: Array<{
    user_id: string;
    read_at: string;
  }>;
  reactions: Array<{
    user_id: string;
    reaction_type: string;
    created_at: string;
  }>;
  priority: string;
  created_at: string;
  updated_at: string;
}

const PlatformPatientChat: React.FC = () => {
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "EMP001"; // Mock current user

  // New Group Form State
  const [newGroupForm, setNewGroupForm] = useState({
    group_name: "",
    patient_id: "",
    patient_name: "",
    group_type: "patient_care",
    participants: [] as any[],
  });

  useEffect(() => {
    loadChatGroups();

    // Initialize WebSocket connection
    websocketService.connect(currentUserId);

    // Subscribe to chat updates
    const unsubscribe = websocketService.subscribe("chat_global", (data) => {
      console.log("Received chat update:", data);
      // Refresh messages if it's for the current group
      if (selectedGroup && data.group_id === selectedGroup.group_id) {
        loadMessages(selectedGroup.group_id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages(selectedGroup.group_id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatGroups = async () => {
    try {
      setIsLoading(true);
      const groups = await communicationAPI.chat.getChatGroups();
      setChatGroups(groups);
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0]);
      }
    } catch (error) {
      console.error("Error loading chat groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (groupId: string) => {
    try {
      const groupMessages = await communicationAPI.chat.getMessages(groupId);
      setMessages(groupMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const messageData = {
        group_id: selectedGroup.group_id,
        sender_id: currentUserId,
        sender_name: "Dr. Sarah Ahmed",
        sender_type: "staff",
        message_type: "text",
        content: newMessage,
        attachments: [],
        priority: "normal",
      };

      await communicationAPI.chat.sendMessage(messageData);
      setNewMessage("");
      loadMessages(selectedGroup.group_id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createNewGroup = async () => {
    try {
      const groupData = {
        ...newGroupForm,
        participants: [
          {
            user_id: currentUserId,
            user_name: "Dr. Sarah Ahmed",
            role: "Head Nurse",
            user_type: "staff",
            permissions: ["read", "write", "admin"],
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
        created_by: "Dr. Sarah Ahmed",
      };

      await communicationAPI.chat.createChatGroup(groupData);
      setShowNewGroupDialog(false);
      setNewGroupForm({
        group_name: "",
        patient_id: "",
        patient_name: "",
        group_type: "patient_care",
        participants: [],
      });
      loadChatGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const addReaction = async (messageId: string, reactionType: string) => {
    try {
      await communicationAPI.chat.addReaction(
        messageId,
        currentUserId,
        reactionType,
      );
      if (selectedGroup) {
        loadMessages(selectedGroup.group_id);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await communicationAPI.chat.markMessageAsRead(messageId, currentUserId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const filteredGroups = chatGroups.filter(
    (group) =>
      group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.patient_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Groups Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Patient Chat
            </h2>
            <Dialog
              open={showNewGroupDialog}
              onOpenChange={setShowNewGroupDialog}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Chat Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group_name">Group Name</Label>
                    <Input
                      id="group_name"
                      value={newGroupForm.group_name}
                      onChange={(e) =>
                        setNewGroupForm({
                          ...newGroupForm,
                          group_name: e.target.value,
                        })
                      }
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient_name">Patient Name</Label>
                    <Input
                      id="patient_name"
                      value={newGroupForm.patient_name}
                      onChange={(e) =>
                        setNewGroupForm({
                          ...newGroupForm,
                          patient_name: e.target.value,
                        })
                      }
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient_id">Patient ID</Label>
                    <Input
                      id="patient_id"
                      value={newGroupForm.patient_id}
                      onChange={(e) =>
                        setNewGroupForm({
                          ...newGroupForm,
                          patient_id: e.target.value,
                        })
                      }
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group_type">Group Type</Label>
                    <Select
                      value={newGroupForm.group_type}
                      onValueChange={(value) =>
                        setNewGroupForm({ ...newGroupForm, group_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient_care">
                          Patient Care
                        </SelectItem>
                        <SelectItem value="therapy_coordination">
                          Therapy Coordination
                        </SelectItem>
                        <SelectItem value="family_communication">
                          Family Communication
                        </SelectItem>
                        <SelectItem value="medical_team">
                          Medical Team
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewGroupDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createNewGroup}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Groups List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredGroups.map((group) => (
              <div
                key={group.group_id}
                onClick={() => setSelectedGroup(group)}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  selectedGroup?.group_id === group.group_id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(group.patient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {group.group_name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {group.participants.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {group.patient_name} •{" "}
                      {group.group_type.replace("_", " ")}
                    </p>
                    <div className="flex items-center mt-1">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          group.status === "active"
                            ? "bg-green-400"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {formatTime(group.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(selectedGroup.patient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedGroup.group_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedGroup.participants.length} participants •{" "}
                      {selectedGroup.group_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGroupSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.message_id}
                    className="flex items-start space-x-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {getInitials(message.sender_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender_name}
                        </span>
                        <Badge
                          variant={
                            message.sender_type === "staff"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {message.sender_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 max-w-lg">
                        <p className="text-sm text-gray-900">
                          {message.content}
                        </p>
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.file_id}
                                className="flex items-center space-x-2 text-xs text-blue-600"
                              >
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.file_name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.reactions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {message.reactions.map((reaction, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                            >
                              {reaction.reaction_type === "thumbs_up"
                                ? "👍"
                                : "❤️"}{" "}
                              1
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() =>
                            addReaction(message.message_id, "thumbs_up")
                          }
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() =>
                            addReaction(message.message_id, "heart")
                          }
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a chat group
              </h3>
              <p className="text-gray-500">
                Choose a group from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Group Settings Dialog */}
      <Dialog open={showGroupSettings} onOpenChange={setShowGroupSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="group_name">Group Name</Label>
                  <Input
                    id="group_name"
                    value={selectedGroup.group_name}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="patient_name">Patient Name</Label>
                  <Input
                    id="patient_name"
                    value={selectedGroup.patient_name}
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={selectedGroup.group_settings.notification_enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="file_sharing">Allow File Sharing</Label>
                  <Switch
                    id="file_sharing"
                    checked={selectedGroup.group_settings.allow_file_sharing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice_messages">Allow Voice Messages</Label>
                  <Switch
                    id="voice_messages"
                    checked={selectedGroup.group_settings.allow_voice_messages}
                  />
                </div>
              </TabsContent>
              <TabsContent value="participants" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Group Members</h4>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedGroup.participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(participant.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {participant.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            participant.user_type === "staff"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {participant.user_type}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Privacy Level</h4>
                  <Select value={selectedGroup.group_settings.privacy_level}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="auto_archive">Auto Archive (days)</Label>
                  <Input
                    id="auto_archive"
                    type="number"
                    value={selectedGroup.group_settings.auto_archive_days}
                    readOnly
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformPatientChat;
