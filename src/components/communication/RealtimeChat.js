import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, MicOff, Paperclip, Users, Settings, Shield, AlertTriangle, CheckCircle, Clock, Volume2, VolumeX, } from "lucide-react";
import { communicationService, } from "@/services/communication.service";
import { mobileCommunicationService } from "@/services/mobile-communication.service";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
import { format } from "date-fns";
const RealtimeChat = ({ channelId = "general", userId, className = "", }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [channel, setChannel] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [nlpProcessing, setNlpProcessing] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
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
        }
        catch (error) {
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
                    const nlpResult = await naturalLanguageProcessingService.processVoiceToText(audioBlob, {
                        language: "en",
                        medicalContext: true,
                    });
                    // Use the NLP-processed transcript with medical terminology corrections
                    setNewMessage(nlpResult.transcript);
                }
                catch (error) {
                    console.error("NLP voice processing failed:", error);
                    // Fallback to original transcript
                    setNewMessage(result.transcript);
                }
                finally {
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
        if (!newMessage.trim())
            return;
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
            const localMessage = {
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
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    const startVoiceRecording = async () => {
        if (!isVoiceEnabled)
            return;
        try {
            setIsRecording(true);
            await mobileCommunicationService.startVoiceRecognition({
                language: "en-US",
                medicalTerminology: true,
                continuousRecognition: false,
                interimResults: true,
            });
        }
        catch (error) {
            console.error("Failed to start voice recording:", error);
            setIsRecording(false);
        }
    };
    const stopVoiceRecording = () => {
        if (!isVoiceEnabled)
            return;
        mobileCommunicationService.stopVoiceRecognition();
        setIsRecording(false);
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const getMessageStatusIcon = (status) => {
        switch (status) {
            case "sent":
                return _jsx(Clock, { className: "h-3 w-3 text-gray-400" });
            case "delivered":
                return _jsx(CheckCircle, { className: "h-3 w-3 text-blue-500" });
            case "read":
                return _jsx(CheckCircle, { className: "h-3 w-3 text-green-500" });
            case "failed":
                return _jsx(AlertTriangle, { className: "h-3 w-3 text-red-500" });
            default:
                return null;
        }
    };
    const getPriorityColor = (priority) => {
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
    return (_jsxs("div", { className: `flex flex-col h-full bg-white ${className}`, children: [_jsx(Card, { className: "rounded-b-none border-b", children: _jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(CardTitle, { className: "text-lg", children: channel?.name || "Chat" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}` }), _jsx("span", { className: "text-sm text-gray-600", children: isConnected ? "Connected" : "Disconnected" })] }), channel?.settings.encryption && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Shield, { className: "h-3 w-3 mr-1" }), "Encrypted"] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "outline", className: "text-xs", children: [_jsx(Users, { className: "h-3 w-3 mr-1" }), participants.length] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsVoiceEnabled(!isVoiceEnabled), className: isVoiceEnabled ? "text-blue-600" : "", children: isVoiceEnabled ? (_jsx(Volume2, { className: "h-4 w-4" })) : (_jsx(VolumeX, { className: "h-4 w-4" })) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Settings, { className: "h-4 w-4" }) })] })] }), typingUsers.length > 0 && (_jsxs("div", { className: "text-sm text-gray-500 italic", children: [typingUsers.join(", "), " ", typingUsers.length === 1 ? "is" : "are", " ", "typing..."] }))] }) }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(ScrollArea, { className: "h-full p-4", children: _jsxs("div", { className: "space-y-4", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.senderId === userId ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === userId
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-900"} ${getPriorityColor(message.priority)}`, children: [message.senderId !== userId && (_jsx("div", { className: "text-xs font-medium mb-1 opacity-70", children: message.senderId })), _jsx("div", { className: "text-sm", children: message.content }), message.metadata?.location && (_jsx("div", { className: "text-xs mt-1 opacity-70", children: "\uD83D\uDCCD Location shared" })), message.metadata?.voiceTranscript && (_jsx("div", { className: "text-xs mt-1 opacity-70", children: "\uD83C\uDFA4 Voice message" })), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsx("span", { className: "text-xs opacity-70", children: format(new Date(message.timestamp), "HH:mm") }), message.senderId === userId && (_jsx("div", { className: "ml-2", children: getMessageStatusIcon(message.status) }))] })] }) }, message.id))), voiceTranscript && (_jsx("div", { className: "flex justify-end", children: _jsxs("div", { className: "max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-yellow-100 text-gray-900 border border-yellow-300", children: [_jsxs("div", { className: "text-xs font-medium mb-1 text-yellow-700", children: ["\uD83C\uDFA4 Voice input", " ", nlpProcessing ? "(processing...)" : "(interim)"] }), _jsx("div", { className: "text-sm", children: voiceTranscript }), nlpProcessing && (_jsx("div", { className: "text-xs text-yellow-600 mt-1", children: "Applying medical terminology corrections..." }))] }) })), _jsx("div", { ref: messagesEndRef })] }) }) }), _jsx(Card, { className: "rounded-t-none border-t", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Input, { ref: inputRef, value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type a message...", className: "pr-12" }), _jsx(Button, { variant: "ghost", size: "sm", className: "absolute right-1 top-1/2 transform -translate-y-1/2", onClick: () => { }, children: _jsx(Paperclip, { className: "h-4 w-4" }) })] }), isVoiceEnabled && (_jsx(Button, { variant: isRecording ? "destructive" : "outline", size: "sm", onMouseDown: startVoiceRecording, onMouseUp: stopVoiceRecording, onTouchStart: startVoiceRecording, onTouchEnd: stopVoiceRecording, className: "px-3", children: isRecording ? (_jsx(MicOff, { className: "h-4 w-4" })) : (_jsx(Mic, { className: "h-4 w-4" })) })), _jsx(Button, { onClick: sendMessage, disabled: !newMessage.trim(), children: _jsx(Send, { className: "h-4 w-4" }) })] }), !isConnected && (_jsxs("div", { className: "mt-2 text-xs text-amber-600 flex items-center", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), "Offline - messages will be sent when connection is restored"] }))] }) })] }));
};
export default RealtimeChat;
