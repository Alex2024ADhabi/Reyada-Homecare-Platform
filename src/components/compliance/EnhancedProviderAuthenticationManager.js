import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Upload, FileText, User, Mail, Phone, Shield, Calendar, Building, UserCheck, Eye, Clock, } from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";
const EnhancedProviderAuthenticationManager = () => {
    const [providers, setProviders] = useState([]);
    const [contactPersons, setContactPersons] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState([]);
    // Form states
    const [newContactPerson, setNewContactPerson] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        providerId: "",
    });
    const [newAppointment, setNewAppointment] = useState({
        providerId: "",
        contactPersonName: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
        validUntil: "",
        issuedBy: "",
        digitalSignature: "",
    });
    useEffect(() => {
        loadProviderData();
    }, []);
    const loadProviderData = async () => {
        try {
            setLoading(true);
            // Mock data with proper sanitization
            const mockProviders = [
                {
                    providerId: "PROV001",
                    providerName: "Reyada Home Healthcare Services",
                    licenseNumber: "LIC-2024-001",
                    specialties: ["Home Nursing", "Physiotherapy", "Medical Equipment"],
                    contactInfo: {
                        phone: "+971-50-123-4567",
                        email: "contact@reyada.ae",
                        address: "Dubai Healthcare City, Dubai, UAE",
                    },
                    credentials: {
                        letterOfAppointment: true,
                        validUntil: "2025-12-31",
                        issuedBy: "Daman Insurance",
                    },
                    status: "active",
                },
                {
                    providerId: "PROV002",
                    providerName: "Elite Care Medical Services",
                    licenseNumber: "LIC-2024-002",
                    specialties: ["Home Nursing", "Wound Care"],
                    contactInfo: {
                        phone: "+971-50-987-6543",
                        email: "info@elitecare.ae",
                        address: "Abu Dhabi, UAE",
                    },
                    credentials: {
                        letterOfAppointment: false,
                        validUntil: "",
                        issuedBy: "",
                    },
                    status: "pending",
                },
            ];
            const mockContactPersons = [
                {
                    id: "CP001",
                    name: "Ahmed Al Mansouri",
                    email: "ahmed.almansouri@reyada.ae",
                    phone: "+971-50-111-2222",
                    role: "Operations Manager",
                    providerId: "PROV001",
                    validated: true,
                    validatedAt: "2024-01-15T10:00:00Z",
                    uaeEmailCompliant: true,
                },
                {
                    id: "CP002",
                    name: "Sarah Johnson",
                    email: "sarah@elitecare.com",
                    phone: "+971-50-333-4444",
                    role: "Clinical Director",
                    providerId: "PROV002",
                    validated: false,
                    uaeEmailCompliant: false,
                },
            ];
            const mockAppointments = [
                {
                    id: "LOA001",
                    providerId: "PROV001",
                    documentId: "DOC-2024-001",
                    contactPersonName: "Ahmed Al Mansouri",
                    contactPersonEmail: "ahmed.almansouri@reyada.ae",
                    contactPersonPhone: "+971-50-111-2222",
                    validUntil: "2025-12-31",
                    issuedBy: "Daman Insurance",
                    digitalSignature: "SIGNATURE_HASH_001",
                    status: "valid",
                    uploadedAt: "2024-01-10T09:00:00Z",
                    validatedAt: "2024-01-15T10:00:00Z",
                },
            ];
            // Sanitize data
            const sanitizedProviders = mockProviders.map((provider) => ({
                ...provider,
                providerName: inputSanitizer.sanitizeText(provider.providerName, 200)
                    .sanitized,
                licenseNumber: inputSanitizer.sanitizeText(provider.licenseNumber, 50)
                    .sanitized,
                contactInfo: {
                    phone: inputSanitizer.sanitizeText(provider.contactInfo.phone, 20)
                        .sanitized,
                    email: inputSanitizer.sanitizeText(provider.contactInfo.email, 100)
                        .sanitized,
                    address: inputSanitizer.sanitizeText(provider.contactInfo.address, 300).sanitized,
                },
            }));
            const sanitizedContacts = mockContactPersons.map((contact) => ({
                ...contact,
                name: inputSanitizer.sanitizeText(contact.name, 100).sanitized,
                email: inputSanitizer.sanitizeText(contact.email, 100).sanitized,
                phone: inputSanitizer.sanitizeText(contact.phone, 20).sanitized,
                role: inputSanitizer.sanitizeText(contact.role, 100).sanitized,
            }));
            const sanitizedAppointments = mockAppointments.map((appointment) => ({
                ...appointment,
                contactPersonName: inputSanitizer.sanitizeText(appointment.contactPersonName, 100).sanitized,
                contactPersonEmail: inputSanitizer.sanitizeText(appointment.contactPersonEmail, 100).sanitized,
                contactPersonPhone: inputSanitizer.sanitizeText(appointment.contactPersonPhone, 20).sanitized,
                issuedBy: inputSanitizer.sanitizeText(appointment.issuedBy, 100)
                    .sanitized,
            }));
            setProviders(sanitizedProviders);
            setContactPersons(sanitizedContacts);
            setAppointments(sanitizedAppointments);
        }
        catch (error) {
            console.error("Error loading provider data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const validateContactPerson = async (contactId) => {
        try {
            const contact = contactPersons.find((c) => c.id === contactId);
            if (!contact)
                return;
            // Validate UAE email domain requirement
            const uaeEmailCompliant = contact.email.endsWith(".ae");
            // Simulate validation process
            const validationData = {
                contactId,
                email: contact.email,
                phone: contact.phone,
                uaeEmailCompliant,
                validatedAt: new Date().toISOString(),
            };
            // Validate JSON structure
            const jsonString = JsonValidator.safeStringify(validationData);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors?.join(", ")}`);
            }
            // Update contact person status
            setContactPersons((prev) => prev.map((c) => c.id === contactId
                ? {
                    ...c,
                    validated: true,
                    validatedAt: new Date().toISOString(),
                    uaeEmailCompliant,
                }
                : c));
            if (!uaeEmailCompliant) {
                setValidationErrors((prev) => [
                    ...prev,
                    `Contact person ${contact.name} must use UAE-hosted email domain (.ae)`,
                ]);
            }
        }
        catch (error) {
            console.error("Error validating contact person:", error);
            setValidationErrors((prev) => [
                ...prev,
                `Validation failed for contact person`,
            ]);
        }
    };
    const validateLetterOfAppointment = async (appointmentId) => {
        try {
            const appointment = appointments.find((a) => a.id === appointmentId);
            if (!appointment)
                return;
            // Validate appointment data
            const validationData = {
                appointmentId,
                providerId: appointment.providerId,
                contactPersonEmail: appointment.contactPersonEmail,
                validUntil: appointment.validUntil,
                digitalSignature: appointment.digitalSignature,
                validatedAt: new Date().toISOString(),
            };
            // Check UAE email domain requirement
            if (!appointment.contactPersonEmail.endsWith(".ae")) {
                throw new Error("Contact person email must use UAE-hosted domain (.ae)");
            }
            // Check expiration date
            const expirationDate = new Date(appointment.validUntil);
            if (expirationDate < new Date()) {
                throw new Error("Letter of appointment has expired");
            }
            // Validate JSON structure
            const jsonString = JsonValidator.safeStringify(validationData);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors?.join(", ")}`);
            }
            // Update appointment status
            setAppointments((prev) => prev.map((a) => a.id === appointmentId
                ? { ...a, status: "valid", validatedAt: new Date().toISOString() }
                : a));
            // Update provider credentials
            setProviders((prev) => prev.map((p) => p.providerId === appointment.providerId
                ? {
                    ...p,
                    credentials: { ...p.credentials, letterOfAppointment: true },
                }
                : p));
        }
        catch (error) {
            console.error("Error validating letter of appointment:", error);
            setValidationErrors((prev) => [
                ...prev,
                `Letter of appointment validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            ]);
            // Update appointment status to rejected
            setAppointments((prev) => prev.map((a) => a.id === appointmentId ? { ...a, status: "rejected" } : a));
        }
    };
    const addContactPerson = async () => {
        try {
            // Validate form data
            const sanitizedData = {
                name: inputSanitizer.sanitizeText(newContactPerson.name, 100).sanitized,
                email: inputSanitizer.sanitizeText(newContactPerson.email, 100)
                    .sanitized,
                phone: inputSanitizer.sanitizeText(newContactPerson.phone, 20)
                    .sanitized,
                role: inputSanitizer.sanitizeText(newContactPerson.role, 100).sanitized,
                providerId: inputSanitizer.sanitizeText(newContactPerson.providerId, 50)
                    .sanitized,
            };
            if (!sanitizedData.name ||
                !sanitizedData.email ||
                !sanitizedData.phone ||
                !sanitizedData.role ||
                !sanitizedData.providerId) {
                throw new Error("All fields are required");
            }
            const newContact = {
                id: `CP${Date.now()}`,
                ...sanitizedData,
                validated: false,
                uaeEmailCompliant: sanitizedData.email.endsWith(".ae"),
            };
            // Validate JSON structure
            const jsonString = JsonValidator.safeStringify(newContact);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                throw new Error(`Contact person creation failed: ${validation.errors?.join(", ")}`);
            }
            setContactPersons((prev) => [...prev, newContact]);
            setNewContactPerson({
                name: "",
                email: "",
                phone: "",
                role: "",
                providerId: "",
            });
        }
        catch (error) {
            console.error("Error adding contact person:", error);
            setValidationErrors((prev) => [
                ...prev,
                `Failed to add contact person: ${error instanceof Error ? error.message : "Unknown error"}`,
            ]);
        }
    };
    const uploadLetterOfAppointment = async () => {
        try {
            // Validate form data
            const sanitizedData = {
                providerId: inputSanitizer.sanitizeText(newAppointment.providerId, 50)
                    .sanitized,
                contactPersonName: inputSanitizer.sanitizeText(newAppointment.contactPersonName, 100).sanitized,
                contactPersonEmail: inputSanitizer.sanitizeText(newAppointment.contactPersonEmail, 100).sanitized,
                contactPersonPhone: inputSanitizer.sanitizeText(newAppointment.contactPersonPhone, 20).sanitized,
                validUntil: inputSanitizer.sanitizeText(newAppointment.validUntil, 20)
                    .sanitized,
                issuedBy: inputSanitizer.sanitizeText(newAppointment.issuedBy, 100)
                    .sanitized,
                digitalSignature: inputSanitizer.sanitizeText(newAppointment.digitalSignature, 200).sanitized,
            };
            if (!sanitizedData.providerId ||
                !sanitizedData.contactPersonName ||
                !sanitizedData.contactPersonEmail ||
                !sanitizedData.validUntil ||
                !sanitizedData.issuedBy) {
                throw new Error("All required fields must be filled");
            }
            const newLOA = {
                id: `LOA${Date.now()}`,
                documentId: `DOC-${Date.now()}`,
                ...sanitizedData,
                status: "pending",
                uploadedAt: new Date().toISOString(),
            };
            // Validate JSON structure
            const jsonString = JsonValidator.safeStringify(newLOA);
            const validation = JsonValidator.validate(jsonString);
            if (!validation.isValid) {
                throw new Error(`Letter of appointment upload failed: ${validation.errors?.join(", ")}`);
            }
            setAppointments((prev) => [...prev, newLOA]);
            setNewAppointment({
                providerId: "",
                contactPersonName: "",
                contactPersonEmail: "",
                contactPersonPhone: "",
                validUntil: "",
                issuedBy: "",
                digitalSignature: "",
            });
        }
        catch (error) {
            console.error("Error uploading letter of appointment:", error);
            setValidationErrors((prev) => [
                ...prev,
                `Failed to upload letter of appointment: ${error instanceof Error ? error.message : "Unknown error"}`,
            ]);
        }
    };
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "active":
            case "valid":
                return "default";
            case "pending":
                return "secondary";
            case "suspended":
            case "rejected":
                return "destructive";
            case "expired":
                return "outline";
            default:
                return "secondary";
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
            case "valid":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
            case "suspended":
            case "rejected":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case "expired":
                return _jsx(Calendar, { className: "h-4 w-4 text-gray-500" });
            default:
                return _jsx(User, { className: "h-4 w-4 text-blue-500" });
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { children: "Loading provider authentication data..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-white min-h-screen", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Provider Authentication Manager" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Enhanced provider authentication with Daman 2025 compliance" })] }), _jsx("div", { className: "flex items-center space-x-4", children: _jsxs(Button, { onClick: loadProviderData, variant: "outline", size: "sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Refresh"] }) })] }), validationErrors.length > 0 && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Validation Errors" }), _jsxs(AlertDescription, { children: [_jsx("ul", { className: "list-disc list-inside", children: validationErrors.map((error, index) => (_jsx("li", { children: error }, index))) }), _jsx(Button, { variant: "outline", size: "sm", className: "mt-2", onClick: () => setValidationErrors([]), children: "Clear Errors" })] })] })), _jsxs(Tabs, { defaultValue: "providers", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "providers", children: "Providers" }), _jsx(TabsTrigger, { value: "contacts", children: "Contact Persons" }), _jsx(TabsTrigger, { value: "appointments", children: "Letters of Appointment" }), _jsx(TabsTrigger, { value: "add", children: "Add New" })] }), _jsx(TabsContent, { value: "providers", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: providers.map((provider) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Building, { className: "h-5 w-5 mr-2" }), provider.providerName] }), _jsxs(Badge, { variant: getStatusBadgeVariant(provider.status), children: [getStatusIcon(provider.status), _jsx("span", { className: "ml-1", children: provider.status })] })] }), _jsxs(CardDescription, { children: ["License: ", provider.licenseNumber] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-700", children: "Specialties" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: provider.specialties.map((specialty, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: specialty }, index))) })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 mr-2 text-gray-500" }), provider.contactInfo.email] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-2 text-gray-500" }), provider.contactInfo.phone] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-700 mb-2", children: "Credentials" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Letter of Appointment" }), provider.credentials.letterOfAppointment ? (_jsxs(Badge, { variant: "default", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Valid"] })) : (_jsxs(Badge, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), "Missing"] }))] }), provider.credentials.validUntil && (_jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Valid until:", " ", new Date(provider.credentials.validUntil).toLocaleDateString()] }))] })] }) })] }, provider.providerId))) }) }), _jsx(TabsContent, { value: "contacts", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: contactPersons.map((contact) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between text-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(UserCheck, { className: "h-5 w-5 mr-2" }), contact.name] }), contact.validated ? (_jsxs(Badge, { variant: "default", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Validated"] })) : (_jsxs(Badge, { variant: "secondary", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), "Pending"] }))] }), _jsx(CardDescription, { children: contact.role })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 gap-2 text-sm", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 mr-2 text-gray-500" }), _jsx("span", { className: !contact.uaeEmailCompliant ? "text-red-600" : "", children: contact.email }), !contact.uaeEmailCompliant && (_jsx(AlertTriangle, { className: "h-4 w-4 ml-2 text-red-500" }))] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-2 text-gray-500" }), contact.phone] })] }), !contact.uaeEmailCompliant && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { className: "text-xs", children: "Email must use UAE-hosted domain (.ae)" })] })), _jsxs("div", { className: "flex justify-between items-center pt-2", children: [_jsxs("span", { className: "text-xs text-gray-500", children: ["Provider: ", contact.providerId] }), !contact.validated && (_jsxs(Button, { size: "sm", onClick: () => validateContactPerson(contact.id), children: [_jsx(Shield, { className: "h-3 w-3 mr-1" }), "Validate"] }))] }), contact.validatedAt && (_jsxs("div", { className: "text-xs text-gray-500", children: ["Validated:", " ", new Date(contact.validatedAt).toLocaleString()] }))] }) })] }, contact.id))) }) }), _jsx(TabsContent, { value: "appointments", className: "space-y-4", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: appointments.map((appointment) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Letter of Appointment"] }), _jsxs(Badge, { variant: getStatusBadgeVariant(appointment.status), children: [getStatusIcon(appointment.status), _jsx("span", { className: "ml-1", children: appointment.status })] })] }), _jsxs(CardDescription, { children: ["Document ID: ", appointment.documentId] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-700", children: "Contact Person" }), _jsx("div", { className: "text-sm text-gray-600", children: appointment.contactPersonName }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Mail, { className: "h-3 w-3 mr-1" }), appointment.contactPersonEmail] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Phone, { className: "h-3 w-3 mr-1" }), appointment.contactPersonPhone] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Valid Until" }), _jsx("div", { className: "font-medium", children: new Date(appointment.validUntil).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: "Issued By" }), _jsx("div", { className: "font-medium", children: appointment.issuedBy })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Uploaded:", " ", new Date(appointment.uploadedAt).toLocaleString(), appointment.validatedAt && (_jsxs("div", { children: ["Validated:", " ", new Date(appointment.validatedAt).toLocaleString()] }))] }), appointment.status === "pending" && (_jsxs(Button, { size: "sm", onClick: () => validateLetterOfAppointment(appointment.id), className: "w-full", children: [_jsx(Shield, { className: "h-3 w-3 mr-1" }), "Validate Appointment"] }))] }) })] }, appointment.id))) }) }), _jsx(TabsContent, { value: "add", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(User, { className: "h-5 w-5 mr-2" }), "Add Contact Person"] }), _jsx(CardDescription, { children: "Add a new designated contact person for a provider" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "contact-name", children: "Full Name" }), _jsx(Input, { id: "contact-name", value: newContactPerson.name, onChange: (e) => setNewContactPerson((prev) => ({
                                                                        ...prev,
                                                                        name: e.target.value,
                                                                    })), placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contact-email", children: "Email (must end with .ae)" }), _jsx(Input, { id: "contact-email", type: "email", value: newContactPerson.email, onChange: (e) => setNewContactPerson((prev) => ({
                                                                        ...prev,
                                                                        email: e.target.value,
                                                                    })), placeholder: "contact@company.ae" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contact-phone", children: "Phone Number" }), _jsx(Input, { id: "contact-phone", value: newContactPerson.phone, onChange: (e) => setNewContactPerson((prev) => ({
                                                                        ...prev,
                                                                        phone: e.target.value,
                                                                    })), placeholder: "+971-50-123-4567" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contact-role", children: "Role" }), _jsx(Input, { id: "contact-role", value: newContactPerson.role, onChange: (e) => setNewContactPerson((prev) => ({
                                                                        ...prev,
                                                                        role: e.target.value,
                                                                    })), placeholder: "Operations Manager" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "contact-provider", children: "Provider ID" }), _jsxs(Select, { value: newContactPerson.providerId, onValueChange: (value) => setNewContactPerson((prev) => ({
                                                                        ...prev,
                                                                        providerId: value,
                                                                    })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsx(SelectContent, { children: providers.map((provider) => (_jsx(SelectItem, { value: provider.providerId, children: provider.providerName }, provider.providerId))) })] })] })] }), _jsxs(Button, { onClick: addContactPerson, className: "w-full", children: [_jsx(User, { className: "h-4 w-4 mr-2" }), "Add Contact Person"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Upload, { className: "h-5 w-5 mr-2" }), "Upload Letter of Appointment"] }), _jsx(CardDescription, { children: "Upload and validate a new letter of appointment" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-provider", children: "Provider" }), _jsxs(Select, { value: newAppointment.providerId, onValueChange: (value) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        providerId: value,
                                                                    })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsx(SelectContent, { children: providers.map((provider) => (_jsx(SelectItem, { value: provider.providerId, children: provider.providerName }, provider.providerId))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-contact-name", children: "Contact Person Name" }), _jsx(Input, { id: "loa-contact-name", value: newAppointment.contactPersonName, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        contactPersonName: e.target.value,
                                                                    })), placeholder: "Contact person full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-contact-email", children: "Contact Person Email" }), _jsx(Input, { id: "loa-contact-email", type: "email", value: newAppointment.contactPersonEmail, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        contactPersonEmail: e.target.value,
                                                                    })), placeholder: "contact@company.ae" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-contact-phone", children: "Contact Person Phone" }), _jsx(Input, { id: "loa-contact-phone", value: newAppointment.contactPersonPhone, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        contactPersonPhone: e.target.value,
                                                                    })), placeholder: "+971-50-123-4567" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-valid-until", children: "Valid Until" }), _jsx(Input, { id: "loa-valid-until", type: "date", value: newAppointment.validUntil, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        validUntil: e.target.value,
                                                                    })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-issued-by", children: "Issued By" }), _jsx(Input, { id: "loa-issued-by", value: newAppointment.issuedBy, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        issuedBy: e.target.value,
                                                                    })), placeholder: "Daman Insurance" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "loa-signature", children: "Digital Signature Hash" }), _jsx(Input, { id: "loa-signature", value: newAppointment.digitalSignature, onChange: (e) => setNewAppointment((prev) => ({
                                                                        ...prev,
                                                                        digitalSignature: e.target.value,
                                                                    })), placeholder: "Digital signature hash" })] })] }), _jsxs(Button, { onClick: uploadLetterOfAppointment, className: "w-full", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload Letter of Appointment"] })] })] })] }) })] })] }));
};
export default EnhancedProviderAuthenticationManager;
