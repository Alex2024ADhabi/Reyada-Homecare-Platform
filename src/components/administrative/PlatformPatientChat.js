import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Users, Plus, Send, Paperclip, Mic, Search, Settings, UserPlus, Phone, Video, MoreVertical, ThumbsUp, Heart, } from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import websocketService from "@/services/websocket.service";
const PlatformPatientChat = () => {
    const [chatGroups, setChatGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUserId = "EMP001"; // Mock current user
    // New Group Form State
    const [newGroupForm, setNewGroupForm] = useState({
        group_name: "",
        patient_id: "",
        patient_name: "",
        group_type: "patient_care",
        participants: [],
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
        }
        catch (error) {
            console.error("Error loading chat groups:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadMessages = async (groupId) => {
        try {
            const groupMessages = await communicationAPI.chat.getMessages(groupId);
            setMessages(groupMessages);
        }
        catch (error) {
            console.error("Error loading messages:", error);
        }
    };
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedGroup)
            return;
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error("Error creating group:", error);
        }
    };
    const addReaction = async (messageId, reactionType) => {
        try {
            await communicationAPI.chat.addReaction(messageId, currentUserId, reactionType);
            if (selectedGroup) {
                loadMessages(selectedGroup.group_id);
            }
        }
        catch (error) {
            console.error("Error adding reaction:", error);
        }
    };
    const markAsRead = async (messageId) => {
        try {
            await communicationAPI.chat.markMessageAsRead(messageId, currentUserId);
        }
        catch (error) {
            console.error("Error marking message as read:", error);
        }
    };
    const filteredGroups = chatGroups.filter((group) => group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading chat groups..." })] }) }));
    }
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsxs("div", { className: "w-80 bg-white border-r border-gray-200 flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(MessageCircle, { className: "h-5 w-5 mr-2 text-blue-600" }), "Patient Chat"] }), _jsxs(Dialog, { open: showNewGroupDialog, onOpenChange: setShowNewGroupDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", children: _jsx(Plus, { className: "h-4 w-4" }) }) }), _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Chat Group" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "group_name", children: "Group Name" }), _jsx(Input, { id: "group_name", value: newGroupForm.group_name, onChange: (e) => setNewGroupForm({
                                                                            ...newGroupForm,
                                                                            group_name: e.target.value,
                                                                        }), placeholder: "Enter group name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patient_name", children: "Patient Name" }), _jsx(Input, { id: "patient_name", value: newGroupForm.patient_name, onChange: (e) => setNewGroupForm({
                                                                            ...newGroupForm,
                                                                            patient_name: e.target.value,
                                                                        }), placeholder: "Enter patient name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patient_id", children: "Patient ID" }), _jsx(Input, { id: "patient_id", value: newGroupForm.patient_id, onChange: (e) => setNewGroupForm({
                                                                            ...newGroupForm,
                                                                            patient_id: e.target.value,
                                                                        }), placeholder: "Enter patient ID" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "group_type", children: "Group Type" }), _jsxs(Select, { value: newGroupForm.group_type, onValueChange: (value) => setNewGroupForm({ ...newGroupForm, group_type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "patient_care", children: "Patient Care" }), _jsx(SelectItem, { value: "therapy_coordination", children: "Therapy Coordination" }), _jsx(SelectItem, { value: "family_communication", children: "Family Communication" }), _jsx(SelectItem, { value: "medical_team", children: "Medical Team" })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowNewGroupDialog(false), children: "Cancel" }), _jsx(Button, { onClick: createNewGroup, className: "bg-blue-600 hover:bg-blue-700", children: "Create Group" })] })] })] })] })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search groups...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] })] }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "p-2", children: filteredGroups.map((group) => (_jsx("div", { onClick: () => setSelectedGroup(group), className: `p-3 rounded-lg cursor-pointer mb-2 transition-colors ${selectedGroup?.group_id === group.group_id
                                    ? "bg-blue-50 border border-blue-200"
                                    : "hover:bg-gray-50"}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Avatar, { className: "h-10 w-10", children: _jsx(AvatarFallback, { className: "bg-blue-100 text-blue-600", children: getInitials(group.patient_name) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: group.group_name }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: group.participants.length })] }), _jsxs("p", { className: "text-xs text-gray-500 truncate", children: [group.patient_name, " \u2022", " ", group.group_type.replace("_", " ")] }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx("div", { className: `h-2 w-2 rounded-full mr-2 ${group.status === "active"
                                                                ? "bg-green-400"
                                                                : "bg-gray-400"}` }), _jsx("span", { className: "text-xs text-gray-400", children: formatTime(group.updated_at) })] })] })] }) }, group.group_id))) }) })] }), _jsx("div", { className: "flex-1 flex flex-col", children: selectedGroup ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-white border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Avatar, { className: "h-10 w-10", children: _jsx(AvatarFallback, { className: "bg-blue-100 text-blue-600", children: getInitials(selectedGroup.patient_name) }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: selectedGroup.group_name }), _jsxs("p", { className: "text-sm text-gray-500", children: [selectedGroup.participants.length, " participants \u2022", " ", selectedGroup.group_type.replace("_", " ")] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Phone, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Video, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Users, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowGroupSettings(true), children: _jsx(Settings, { className: "h-4 w-4" }) })] })] }) }), _jsx(ScrollArea, { className: "flex-1 p-4", children: _jsxs("div", { className: "space-y-4", children: [messages.map((message) => (_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "bg-gray-100 text-gray-600 text-xs", children: getInitials(message.sender_name) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: message.sender_name }), _jsx(Badge, { variant: message.sender_type === "staff"
                                                                    ? "default"
                                                                    : "secondary", className: "text-xs", children: message.sender_type }), _jsx("span", { className: "text-xs text-gray-500", children: formatTime(message.created_at) })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3 max-w-lg", children: [_jsx("p", { className: "text-sm text-gray-900", children: message.content }), message.attachments.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: message.attachments.map((attachment) => (_jsxs("div", { className: "flex items-center space-x-2 text-xs text-blue-600", children: [_jsx(Paperclip, { className: "h-3 w-3" }), _jsx("span", { children: attachment.file_name })] }, attachment.file_id))) }))] }), message.reactions.length > 0 && (_jsx("div", { className: "flex items-center space-x-1 mt-1", children: message.reactions.map((reaction, index) => (_jsxs("span", { className: "text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full", children: [reaction.reaction_type === "thumbs_up"
                                                                    ? "👍"
                                                                    : "❤️", " ", "1"] }, index))) })), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2 text-xs", onClick: () => addReaction(message.message_id, "thumbs_up"), children: _jsx(ThumbsUp, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 px-2 text-xs", onClick: () => addReaction(message.message_id, "heart"), children: _jsx(Heart, { className: "h-3 w-3" }) })] })] })] }, message.message_id))), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { className: "bg-white border-t border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Paperclip, { className: "h-4 w-4" }) }), _jsx("div", { className: "flex-1 relative", children: _jsx(Textarea, { placeholder: "Type your message...", value: newMessage, onChange: (e) => setNewMessage(e.target.value), onKeyPress: (e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }, className: "min-h-[40px] max-h-32 resize-none" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Mic, { className: "h-4 w-4" }) }), _jsx(Button, { onClick: sendMessage, disabled: !newMessage.trim(), className: "bg-blue-600 hover:bg-blue-700", children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageCircle, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Select a chat group" }), _jsx("p", { className: "text-gray-500", children: "Choose a group from the sidebar to start messaging" })] }) })) }), _jsx(Dialog, { open: showGroupSettings, onOpenChange: setShowGroupSettings, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Group Settings" }) }), selectedGroup && (_jsxs(Tabs, { defaultValue: "general", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "general", children: "General" }), _jsx(TabsTrigger, { value: "participants", children: "Participants" }), _jsx(TabsTrigger, { value: "permissions", children: "Permissions" })] }), _jsxs(TabsContent, { value: "general", className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "group_name", children: "Group Name" }), _jsx(Input, { id: "group_name", value: selectedGroup.group_name, readOnly: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patient_name", children: "Patient Name" }), _jsx(Input, { id: "patient_name", value: selectedGroup.patient_name, readOnly: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "notifications", children: "Enable Notifications" }), _jsx(Switch, { id: "notifications", checked: selectedGroup.group_settings.notification_enabled })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "file_sharing", children: "Allow File Sharing" }), _jsx(Switch, { id: "file_sharing", checked: selectedGroup.group_settings.allow_file_sharing })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "voice_messages", children: "Allow Voice Messages" }), _jsx(Switch, { id: "voice_messages", checked: selectedGroup.group_settings.allow_voice_messages })] })] }), _jsxs(TabsContent, { value: "participants", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-medium", children: "Group Members" }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(UserPlus, { className: "h-4 w-4 mr-2" }), "Add Member"] })] }), _jsx("div", { className: "space-y-2", children: selectedGroup.participants.map((participant) => (_jsxs("div", { className: "flex items-center justify-between p-2 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "text-xs", children: getInitials(participant.user_name) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: participant.user_name }), _jsx("p", { className: "text-xs text-gray-500", children: participant.role })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: participant.user_type === "staff"
                                                                    ? "default"
                                                                    : "secondary", children: participant.user_type }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(MoreVertical, { className: "h-4 w-4" }) })] })] }, participant.user_id))) })] }), _jsxs(TabsContent, { value: "permissions", className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Privacy Level" }), _jsxs(Select, { value: selectedGroup.group_settings.privacy_level, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "public", children: "Public" }), _jsx(SelectItem, { value: "restricted", children: "Restricted" }), _jsx(SelectItem, { value: "private", children: "Private" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "auto_archive", children: "Auto Archive (days)" }), _jsx(Input, { id: "auto_archive", type: "number", value: selectedGroup.group_settings.auto_archive_days, readOnly: true })] })] })] }))] }) })] }));
};
export default PlatformPatientChat;
