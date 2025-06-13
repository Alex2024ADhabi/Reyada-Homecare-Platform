import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Mail, Phone, Edit, Trash2, UserCheck, UserX, CheckCircle, } from "lucide-react";
import { useFamilyAccess } from "@/hooks/useFamilyAccess";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
export const FamilyAccessControls = ({ patientId, className = "", }) => {
    const { toast } = useToast();
    const { familyMembers, isLoading, inviteFamilyMember, updateFamilyMember, removeFamilyMember, suspendFamilyMember, reactivateFamilyMember, } = useFamilyAccess(patientId);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [inviteForm, setInviteForm] = useState({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        accessLevel: "view",
        permissions: {
            viewCarePlan: true,
            viewAppointments: true,
            viewMedications: false,
            viewProgress: true,
            receiveNotifications: false,
            communicateWithProviders: false,
        },
    });
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "suspended":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getAccessLevelColor = (level) => {
        switch (level) {
            case "full":
                return "bg-blue-100 text-blue-800";
            case "limited":
                return "bg-orange-100 text-orange-800";
            case "view":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const handleInviteMember = async () => {
        try {
            await inviteFamilyMember(inviteForm);
            setIsInviteDialogOpen(false);
            setInviteForm({
                name: "",
                email: "",
                phone: "",
                relationship: "",
                accessLevel: "view",
                permissions: {
                    viewCarePlan: true,
                    viewAppointments: true,
                    viewMedications: false,
                    viewProgress: true,
                    receiveNotifications: false,
                    communicateWithProviders: false,
                },
            });
            toast({
                title: "Invitation Sent",
                description: "Family member has been invited successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to send invitation.",
                variant: "destructive",
            });
        }
    };
    const handleUpdateMember = async () => {
        if (!selectedMember)
            return;
        try {
            await updateFamilyMember(selectedMember.id, {
                accessLevel: selectedMember.accessLevel,
                permissions: selectedMember.permissions,
            });
            setIsEditDialogOpen(false);
            setSelectedMember(null);
            toast({
                title: "Settings Updated",
                description: "Family member settings have been updated.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to update family member settings.",
                variant: "destructive",
            });
        }
    };
    const handleSuspendMember = async (memberId) => {
        try {
            await suspendFamilyMember(memberId);
            toast({
                title: "Access Suspended",
                description: "Family member access has been suspended.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to suspend family member access.",
                variant: "destructive",
            });
        }
    };
    const handleReactivateMember = async (memberId) => {
        try {
            await reactivateFamilyMember(memberId);
            toast({
                title: "Access Reactivated",
                description: "Family member access has been reactivated.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to reactivate family member access.",
                variant: "destructive",
            });
        }
    };
    const handleRemoveMember = async (memberId) => {
        try {
            await removeFamilyMember(memberId);
            toast({
                title: "Family Member Removed",
                description: "Family member has been removed from your account.",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove family member.",
                variant: "destructive",
            });
        }
    };
    const relationshipOptions = [
        "Spouse",
        "Parent",
        "Child",
        "Sibling",
        "Guardian",
        "Other",
    ];
    const permissionLabels = {
        viewCarePlan: "View Care Plans",
        viewAppointments: "View Appointments",
        viewMedications: "View Medications",
        viewProgress: "View Progress Notes",
        receiveNotifications: "Receive Notifications",
        communicateWithProviders: "Communicate with Providers",
    };
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Family Access Controls" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage who can access your health information" })] }), _jsxs(Dialog, { open: isInviteDialogOpen, onOpenChange: setIsInviteDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "mt-4 sm:mt-0", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Invite Family Member"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Invite Family Member" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Full Name" }), _jsx(Input, { value: inviteForm.name, onChange: (e) => setInviteForm((prev) => ({
                                                                    ...prev,
                                                                    name: e.target.value,
                                                                })), placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Relationship" }), _jsxs(Select, { value: inviteForm.relationship, onValueChange: (value) => setInviteForm((prev) => ({
                                                                    ...prev,
                                                                    relationship: value,
                                                                })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select relationship" }) }), _jsx(SelectContent, { children: relationshipOptions.map((option) => (_jsx(SelectItem, { value: option.toLowerCase(), children: option }, option))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Email Address" }), _jsx(Input, { type: "email", value: inviteForm.email, onChange: (e) => setInviteForm((prev) => ({
                                                                    ...prev,
                                                                    email: e.target.value,
                                                                })), placeholder: "Enter email address" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium", children: "Phone Number" }), _jsx(Input, { type: "tel", value: inviteForm.phone, onChange: (e) => setInviteForm((prev) => ({
                                                                    ...prev,
                                                                    phone: e.target.value,
                                                                })), placeholder: "Enter phone number" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Access Level" }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                                                            {
                                                                value: "view",
                                                                label: "View Only",
                                                                description: "Can view basic information",
                                                            },
                                                            {
                                                                value: "limited",
                                                                label: "Limited Access",
                                                                description: "Can view and receive notifications",
                                                            },
                                                            {
                                                                value: "full",
                                                                label: "Full Access",
                                                                description: "Can view and communicate",
                                                            },
                                                        ].map((level) => (_jsxs("button", { onClick: () => setInviteForm((prev) => ({
                                                                ...prev,
                                                                accessLevel: level.value,
                                                            })), className: `p-3 text-left border rounded-lg transition-colors ${inviteForm.accessLevel === level.value
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-gray-200 hover:border-gray-300"}`, children: [_jsx("div", { className: "font-medium text-sm", children: level.label }), _jsx("div", { className: "text-xs text-gray-600", children: level.description })] }, level.value))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Specific Permissions" }), _jsx("div", { className: "space-y-3", children: Object.entries(permissionLabels).map(([key, label]) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: key, checked: inviteForm.permissions[key], onCheckedChange: (checked) => setInviteForm((prev) => ({
                                                                        ...prev,
                                                                        permissions: {
                                                                            ...prev.permissions,
                                                                            [key]: checked,
                                                                        },
                                                                    })) }), _jsx(Label, { htmlFor: key, className: "text-sm", children: label })] }, key))) })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setIsInviteDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleInviteMember, children: [_jsx(Mail, { className: "h-4 w-4 mr-2" }), "Send Invitation"] })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2" }), "Family Members (", familyMembers.length, ")"] }) }), _jsx(CardContent, { children: familyMembers.length > 0 ? (_jsx("div", { className: "space-y-4", children: familyMembers.map((member) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Avatar, { children: _jsx(AvatarFallback, { children: member.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("") }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: member.name }), _jsx(Badge, { className: getStatusColor(member.status), children: member.status }), _jsx(Badge, { className: getAccessLevelColor(member.accessLevel), children: member.accessLevel })] }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: member.relationship }), _jsxs("div", { className: "flex items-center space-x-4 mt-1 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Mail, { className: "h-3 w-3" }), _jsx("span", { children: member.email })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Phone, { className: "h-3 w-3" }), _jsx("span", { children: member.phone })] })] }), member.status === "pending" && (_jsxs("p", { className: "text-xs text-yellow-600 mt-1", children: ["Invited", " ", format(new Date(member.invitedAt), "MMM dd, yyyy")] })), member.activatedAt && (_jsxs("p", { className: "text-xs text-green-600 mt-1", children: ["Active since", " ", format(new Date(member.activatedAt), "MMM dd, yyyy")] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                    setSelectedMember(member);
                                                    setIsEditDialogOpen(true);
                                                }, children: _jsx(Edit, { className: "h-4 w-4" }) }), member.status === "active" ? (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleSuspendMember(member.id), children: _jsx(UserX, { className: "h-4 w-4" }) })) : member.status === "suspended" ? (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleReactivateMember(member.id), children: _jsx(UserCheck, { className: "h-4 w-4" }) })) : null, _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleRemoveMember(member.id), className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }, member.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Family Members" }), _jsx("p", { className: "text-gray-500 mb-6", children: "You haven't invited any family members to access your health information yet." }), _jsxs(Button, { onClick: () => setIsInviteDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Invite Your First Family Member"] })] })) })] }), _jsx(Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Family Member Access" }) }), selectedMember && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-4 p-4 bg-gray-50 rounded-lg", children: [_jsx(Avatar, { children: _jsx(AvatarFallback, { children: selectedMember.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("") }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: selectedMember.name }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: selectedMember.relationship })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Access Level" }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                                                {
                                                    value: "view",
                                                    label: "View Only",
                                                    description: "Can view basic information",
                                                },
                                                {
                                                    value: "limited",
                                                    label: "Limited Access",
                                                    description: "Can view and receive notifications",
                                                },
                                                {
                                                    value: "full",
                                                    label: "Full Access",
                                                    description: "Can view and communicate",
                                                },
                                            ].map((level) => (_jsxs("button", { onClick: () => setSelectedMember((prev) => prev
                                                    ? {
                                                        ...prev,
                                                        accessLevel: level.value,
                                                    }
                                                    : null), className: `p-3 text-left border rounded-lg transition-colors ${selectedMember.accessLevel === level.value
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"}`, children: [_jsx("div", { className: "font-medium text-sm", children: level.label }), _jsx("div", { className: "text-xs text-gray-600", children: level.description })] }, level.value))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium mb-3 block", children: "Specific Permissions" }), _jsx("div", { className: "space-y-3", children: Object.entries(permissionLabels).map(([key, label]) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `edit-${key}`, checked: selectedMember.permissions[key], onCheckedChange: (checked) => setSelectedMember((prev) => prev
                                                            ? {
                                                                ...prev,
                                                                permissions: {
                                                                    ...prev.permissions,
                                                                    [key]: checked,
                                                                },
                                                            }
                                                            : null) }), _jsx(Label, { htmlFor: `edit-${key}`, className: "text-sm", children: label })] }, key))) })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleUpdateMember, children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Update Settings"] })] })] }))] }) })] }));
};
export default FamilyAccessControls;
