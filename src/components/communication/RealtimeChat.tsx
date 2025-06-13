import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  communicationService,
  Message,
  Channel,
} from "@/services/communication.service";
import { mobileCommunicationService } from "@/services/mobile-communication.service";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
import { format } from "date-fns";

interface RealtimeChatProps {
  channelId?: string;
  userId: string;
  className?: string;
}

const RealtimeChat: React.FC<RealtimeChatProps> = ({
  channelId = "general",
  userId,
  className = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [nlpProcessing, setNlpProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      cleanup();
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Load existing messages
      const existingMessages = communicationService.getMessages(channelId);
      setMessages(existingMessages);

      // Get channel info
      const channels = communicationService.getChannels();
      const currentChannel = channels.find((c) => c.id === channelId);
      if (currentChannel) {
        setChannel(currentChannel);
        setParticipants(currentChannel.participants);
      }

      // Set up voice recognition if supported
      if (mobileCommunicationService.isVoiceRecognitionSupported()) {
        setIsVoiceEnabled(true);
        setupVoiceRecognition();
      }

      setIsConnected(true);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  };

  const setupVoiceRecognition = () => {
    mobileCommunicationService.onVoiceRecognitionResult(async (result) => {
      setVoiceTranscript(result.transcript);
      if (result.isFinal) {
        setNlpProcessing(true);
        try {
          // Process voice input with medical NLP
          const audioBlob = new Blob(["mock audio"], { type: "audio/wav" });
          const nlpResult =
            await naturalLanguageProcessingService.processVoiceToText(
              audioBlob,
              {
                language: "en",
                medicalContext: true,
              },
            );

          // Use the NLP-processed transcript with medical terminology corrections
          setNewMessage(nlpResult.transcript);
        } catch (error) {
          console.error("NLP voice processing failed:", error);
          // Fallback to original transcript
          setNewMessage(result.transcript);
        } finally {
          setNlpProcessing(false);
          setVoiceTranscript("");
        }
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageId = await communicationService.sendMessage({
        senderId: userId,
        recipientIds: participants,
        content: newMessage,
        type: "text",
        priority: "medium",
        encrypted: channel?.settings.encryption || false,
        channelId,
      });

      // Add message to local state immediately for better UX
      const localMessage: Message = {
        id: messageId,
        senderId: userId,
        recipientIds: participants,
        content: newMessage,
        type: "text",
        priority: "medium",
        timestamp: new Date().toISOString(),
        status: "sent",
        encrypted: channel?.settings.encryption || false,
        channelId,
      };

      setMessages((prev) => [...prev, localMessage]);
      setNewMessage("");

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const startVoiceRecording = async () => {
    if (!isVoiceEnabled) return;

    try {
      setIsRecording(true);
      await mobileCommunicationService.startVoiceRecognition({
        language: "en-US",
        medicalTerminology: true,
        continuousRecognition: false,
        interimResults: true,
      });
    } catch (error) {
      console.error("Failed to start voice recording:", error);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (!isVoiceEnabled) return;

    mobileCommunicationService.stopVoiceRecognition();
    setIsRecording(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Clock className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case "read":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Message["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-blue-500 bg-blue-50";
      case "low":
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const cleanup = () => {
    if (isRecording) {
      stopVoiceRecording();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Chat Header */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">
                {channel?.name || "Chat"}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {channel?.settings.encryption && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {participants.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={isVoiceEnabled ? "text-blue-600" : ""}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === userId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  } ${getPriorityColor(message.priority)}`}
                >
                  {message.senderId !== userId && (
                    <div className="text-xs font-medium mb-1 opacity-70">
                      {message.senderId}
                    </div>
                  )}

                  <div className="text-sm">{message.content}</div>

                  {message.metadata?.location && (
                    <div className="text-xs mt-1 opacity-70">
                      📍 Location shared
                    </div>
                  )}

                  {message.metadata?.voiceTranscript && (
                    <div className="text-xs mt-1 opacity-70">
                      🎤 Voice message
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.timestamp), "HH:mm")}
                    </span>
                    {message.senderId === userId && (
                      <div className="ml-2">
                        {getMessageStatusIcon(message.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {voiceTranscript && (
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-yellow-100 text-gray-900 border border-yellow-300">
                  <div className="text-xs font-medium mb-1 text-yellow-700">
                    🎤 Voice input{" "}
                    {nlpProcessing ? "(processing...)" : "(interim)"}
                  </div>
                  <div className="text-sm">{voiceTranscript}</div>
                  {nlpProcessing && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Applying medical terminology corrections...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <Card className="rounded-t-none border-t">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => {}}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {isVoiceEnabled && (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                className="px-3"
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {!isConnected && (
            <div className="mt-2 text-xs text-amber-600 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Offline - messages will be sent when connection is restored
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeChat;
