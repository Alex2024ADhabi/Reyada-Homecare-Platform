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
  Camera,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Image,
  FileText,
  Download,
  X,
  Maximize2,
  Minimize2,
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
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVideoCallMinimized, setIsVideoCallMinimized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [videoCallPosition, setVideoCallPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      for (const file of fileArray) {
        // Validate file type and size
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Create file message
        const fileMessage: Message = {
          id: `file_${Date.now()}_${Math.random()}`,
          senderId: userId,
          recipientIds: participants,
          content: `Shared ${file.type.startsWith("image/") ? "image" : "document"}: ${file.name}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          priority: "medium",
          timestamp: new Date().toISOString(),
          status: "sent",
          encrypted: channel?.settings.encryption || false,
          channelId,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: URL.createObjectURL(file), // In real app, upload to server first
          },
        };

        setMessages((prev) => [...prev, fileMessage]);
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const startVideoCall = async () => {
    try {
      setIsVideoCallActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Send video call message
      const callMessage: Message = {
        id: `call_${Date.now()}`,
        senderId: userId,
        recipientIds: participants,
        content: "📹 Started video call",
        type: "system",
        priority: "high",
        timestamp: new Date().toISOString(),
        status: "sent",
        encrypted: channel?.settings.encryption || false,
        channelId,
        metadata: {
          callType: "video",
          callStatus: "started",
        },
      };

      setMessages((prev) => [...prev, callMessage]);
    } catch (error) {
      console.error("Failed to start video call:", error);
      alert("Unable to access camera/microphone. Please check permissions.");
    }
  };

  const endVideoCall = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    setIsVideoCallActive(false);
    setIsVideoCallMinimized(false);
    setVideoCallPosition({ x: 20, y: 20 });
    setIsDragging(false);

    // Send call ended message
    const endCallMessage: Message = {
      id: `call_end_${Date.now()}`,
      senderId: userId,
      recipientIds: participants,
      content: "📹 Video call ended",
      type: "system",
      priority: "medium",
      timestamp: new Date().toISOString(),
      status: "sent",
      encrypted: channel?.settings.encryption || false,
      channelId,
      metadata: {
        callType: "video",
        callStatus: "ended",
      },
    };

    setMessages((prev) => [...prev, endCallMessage]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isVideoCallMinimized) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && isVideoCallMinimized) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within bounds
      const maxX = window.innerWidth - 256; // 256px is the width of minimized call
      const maxY = window.innerHeight - 192; // 192px is the height of minimized call

      setVideoCallPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const renderFileMessage = (message: Message) => {
    if (!message.metadata?.fileName) return null;

    const isImage = message.type === "image";
    const fileUrl = message.metadata.fileUrl;
    const fileName = message.metadata.fileName;
    const fileSize = message.metadata.fileSize;

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(fileUrl, "_blank")}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {fileName}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border max-w-xs">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.download = fileName;
                link.click();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const cleanup = () => {
    if (isRecording) {
      stopVoiceRecording();
    }
    if (isVideoCallActive) {
      endVideoCall();
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

                  {(message.type === "image" || message.type === "file") &&
                    renderFileMessage(message)}

                  {message.metadata?.callType && (
                    <div className="text-xs mt-1 opacity-70">
                      {message.metadata.callType === "video" ? "📹" : "📞"}{" "}
                      {message.metadata.callStatus}
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

      {/* Video Call Interface */}
      {isVideoCallActive && (
        <div
          className={`fixed ${isVideoCallMinimized ? "w-64 h-48" : "inset-4"} bg-black rounded-lg z-50 flex flex-col ${isDragging ? "cursor-grabbing" : isVideoCallMinimized ? "cursor-grab" : ""}`}
          style={
            isVideoCallMinimized
              ? {
                  left: `${videoCallPosition.x}px`,
                  top: `${videoCallPosition.y}px`,
                }
              : {}
          }
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-t-lg select-none">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Video Call</span>
              {isVideoCallMinimized && (
                <span className="text-xs text-gray-400 ml-2">
                  (Drag to move)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoCallMinimized(!isVideoCallMinimized)}
                className="text-white hover:bg-gray-700"
              >
                {isVideoCallMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={endVideoCall}
                className="text-red-400 hover:bg-red-900"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            {/* Remote video (main) */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />

            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            {/* Call controls */}
            {!isVideoCallMinimized && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={endVideoCall}>
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* File Upload Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
              disabled={isUploading}
            >
              <Image className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx";
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
              disabled={isUploading}
            >
              <FileText className="h-4 w-4" />
            </Button>

            {/* Video Call Button */}
            <Button
              variant={isVideoCallActive ? "destructive" : "outline"}
              size="sm"
              onClick={isVideoCallActive ? endVideoCall : startVideoCall}
            >
              {isVideoCallActive ? (
                <VideoOff className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </Button>

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

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-2 text-xs text-blue-600 flex items-center">
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Uploading files...
            </div>
          )}

          {!isConnected && (
            <div className="mt-2 text-xs text-amber-600 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Offline - messages will be sent when connection is restored
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeChat;
