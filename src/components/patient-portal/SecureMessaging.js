import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Paperclip, Search, Plus, Archive, Star, CheckCircle, Clock, Filter, } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useSecureMessaging } from "@/hooks/useSecureMessaging";
export const SecureMessaging = ({ patientId, recentMessages, className = "", }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isComposingNew, setIsComposingNew] = useState(false);
    const [newMessageSubject, setNewMessageSubject] = useState("");
    const [newMessageRecipient, setNewMessageRecipient] = useState("");
    const [activeTab, setActiveTab] = useState("inbox");
    const { conversations, messages, isLoading, sendMessage, markAsRead, archiveConversation, createNewConversation, } = useSecureMessaging(patientId);
    const getMessageDateLabel = (date) => {
        const messageDate = new Date(date);
        if (isToday(messageDate))
            return format(messageDate, "HH:mm");
        if (isYesterday(messageDate))
            return "Yesterday";
        return format(messageDate, "MMM dd");
    };
    const getPriorityColor = (priority) => {
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
    const getStatusIcon = (status) => {
        switch (status) {
            case "sent":
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
            case "delivered":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-blue-500" });
            case "read":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            default:
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation)
            return;
        try {
            await sendMessage({
                conversationId: selectedConversation.id,
                content: newMessage,
                priority: "normal",
            });
            setNewMessage("");
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    const handleCreateNewMessage = async () => {
        if (!newMessageSubject.trim() ||
            !newMessage.trim() ||
            !newMessageRecipient) {
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
        }
        catch (error) {
            console.error("Failed to create new message:", error);
        }
    };
    const filteredConversations = conversations.filter((conv) => conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Messages" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Secure communication with your healthcare providers" })] }), _jsxs(Dialog, { open: isComposingNew, onOpenChange: setIsComposingNew, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "mt-4 sm:mt-0", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Message"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Compose New Message" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To" }), _jsx(Input, { value: newMessageRecipient, onChange: (e) => setNewMessageRecipient(e.target.value), placeholder: "Select healthcare provider..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Subject" }), _jsx(Input, { value: newMessageSubject, onChange: (e) => setNewMessageSubject(e.target.value), placeholder: "Enter message subject..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Message" }), _jsx(Textarea, { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type your message here...", rows: 6 })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setIsComposingNew(false), children: "Cancel" }), _jsxs(Button, { onClick: handleCreateNewMessage, children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Send Message"] })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Conversations" }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Filter, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search conversations...", className: "pl-10" })] })] }), _jsx(CardContent, { className: "p-0", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "inbox", children: "Inbox" }), _jsx(TabsTrigger, { value: "sent", children: "Sent" }), _jsx(TabsTrigger, { value: "archived", children: "Archived" })] }), _jsx(TabsContent, { value: "inbox", className: "mt-0", children: _jsx("div", { className: "space-y-1", children: filteredConversations.length > 0 ? (filteredConversations.map((conversation) => (_jsx("button", { onClick: () => {
                                                            setSelectedConversation(conversation);
                                                            if (conversation.unreadCount > 0) {
                                                                markAsRead(conversation.id);
                                                            }
                                                        }, className: `w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id
                                                            ? "bg-blue-50 border-blue-200"
                                                            : ""}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsxs(Avatar, { className: "h-10 w-10", children: [_jsx(AvatarImage, { src: conversation.participants[1]?.avatar }), _jsx(AvatarFallback, { children: conversation.participants[1]?.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("") })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: `text-sm font-medium truncate ${conversation.unreadCount > 0
                                                                                        ? "text-gray-900"
                                                                                        : "text-gray-700"}`, children: conversation.participants[1]?.name }), _jsxs("div", { className: "flex items-center space-x-1", children: [conversation.unreadCount > 0 && (_jsx(Badge, { className: "h-5 w-5 flex items-center justify-center text-xs", children: conversation.unreadCount })), _jsx("span", { className: "text-xs text-gray-500", children: getMessageDateLabel(conversation.lastMessage.sentAt) })] })] }), _jsx("p", { className: "text-sm font-medium text-gray-900 truncate mt-1", children: conversation.subject }), _jsx("p", { className: "text-sm text-gray-600 truncate", children: conversation.lastMessage.content })] })] }) }, conversation.id)))) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(MessageSquare, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No conversations found" })] })) }) }), _jsx(TabsContent, { value: "sent", className: "mt-0", children: _jsxs("div", { className: "text-center py-8", children: [_jsx(MessageSquare, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Sent messages will appear here" })] }) }), _jsx(TabsContent, { value: "archived", className: "mt-0", children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Archive, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Archived conversations will appear here" })] }) })] }) })] }) }), _jsx("div", { className: "lg:col-span-2", children: selectedConversation ? (_jsxs(Card, { className: "h-[600px] flex flex-col", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: selectedConversation.participants[1]?.avatar }), _jsx(AvatarFallback, { children: selectedConversation.participants[1]?.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("") })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: selectedConversation.participants[1]?.name }), _jsx("p", { className: "text-sm text-gray-600", children: selectedConversation.subject })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Star, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => archiveConversation(selectedConversation.id), children: _jsx(Archive, { className: "h-4 w-4" }) })] })] }) }), _jsx(CardContent, { className: "flex-1 overflow-y-auto p-4", children: _jsx("div", { className: "space-y-4", children: messages.map((message) => (_jsx("div", { className: `flex ${message.senderType === "patient"
                                                ? "justify-end"
                                                : "justify-start"}`, children: _jsxs("div", { className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderType === "patient"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-900"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-medium", children: message.senderName }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Badge, { className: getPriorityColor(message.priority), children: message.priority }), getStatusIcon(message.status)] })] }), _jsx("p", { className: "text-sm", children: message.content }), _jsx("div", { className: "flex items-center justify-between mt-2", children: _jsx("span", { className: "text-xs opacity-75", children: format(new Date(message.sentAt), "MMM dd, HH:mm") }) }), message.attachments &&
                                                        message.attachments.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: message.attachments.map((attachment) => (_jsxs("div", { className: "flex items-center space-x-2 text-xs", children: [_jsx(Paperclip, { className: "h-3 w-3" }), _jsx("span", { children: attachment.name })] }, attachment.id))) }))] }) }, message.id))) }) }), _jsx("div", { className: "border-t p-4", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Textarea, { value: newMessage, onChange: (e) => setNewMessage(e.target.value), placeholder: "Type your message...", rows: 2, className: "flex-1" }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Paperclip, { className: "h-4 w-4" }) }), _jsx(Button, { onClick: handleSendMessage, disabled: !newMessage.trim(), size: "sm", children: _jsx(Send, { className: "h-4 w-4" }) })] })] }) })] })) : (_jsx(Card, { className: "h-[600px] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageSquare, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Select a Conversation" }), _jsx("p", { className: "text-gray-500", children: "Choose a conversation from the list to view messages and reply." })] }) })) })] })] }));
};
export default SecureMessaging;
