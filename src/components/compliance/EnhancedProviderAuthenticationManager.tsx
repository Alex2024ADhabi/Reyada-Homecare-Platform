import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertTriangle,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Building,
  UserCheck,
  Lock,
  Eye,
  Download,
  Clock,
} from "lucide-react";
import { JsonValidator } from "@/utils/json-validator";
import { inputSanitizer } from "@/services/input-sanitization.service";

interface ProviderInfo {
  providerId: string;
  providerName: string;
  licenseNumber: string;
  specialties: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  credentials: {
    letterOfAppointment: boolean;
    validUntil: string;
    issuedBy: string;
  };
  status: "active" | "pending" | "suspended" | "expired";
}

interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  providerId: string;
  validated: boolean;
  validatedAt?: string;
  uaeEmailCompliant: boolean;
}

interface LetterOfAppointment {
  id: string;
  providerId: string;
  documentId: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  validUntil: string;
  issuedBy: string;
  digitalSignature: string;
  status: "valid" | "expired" | "pending" | "rejected";
  uploadedAt: string;
  validatedAt?: string;
}

const EnhancedProviderAuthenticationManager: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [appointments, setAppointments] = useState<LetterOfAppointment[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      const mockProviders: ProviderInfo[] = [
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

      const mockContactPersons: ContactPerson[] = [
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

      const mockAppointments: LetterOfAppointment[] = [
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
          address: inputSanitizer.sanitizeText(
            provider.contactInfo.address,
            300,
          ).sanitized,
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
        contactPersonName: inputSanitizer.sanitizeText(
          appointment.contactPersonName,
          100,
        ).sanitized,
        contactPersonEmail: inputSanitizer.sanitizeText(
          appointment.contactPersonEmail,
          100,
        ).sanitized,
        contactPersonPhone: inputSanitizer.sanitizeText(
          appointment.contactPersonPhone,
          20,
        ).sanitized,
        issuedBy: inputSanitizer.sanitizeText(appointment.issuedBy, 100)
          .sanitized,
      }));

      setProviders(sanitizedProviders);
      setContactPersons(sanitizedContacts);
      setAppointments(sanitizedAppointments);
    } catch (error) {
      console.error("Error loading provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateContactPerson = async (contactId: string) => {
    try {
      const contact = contactPersons.find((c) => c.id === contactId);
      if (!contact) return;

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
      setContactPersons((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? {
                ...c,
                validated: true,
                validatedAt: new Date().toISOString(),
                uaeEmailCompliant,
              }
            : c,
        ),
      );

      if (!uaeEmailCompliant) {
        setValidationErrors((prev) => [
          ...prev,
          `Contact person ${contact.name} must use UAE-hosted email domain (.ae)`,
        ]);
      }
    } catch (error) {
      console.error("Error validating contact person:", error);
      setValidationErrors((prev) => [
        ...prev,
        `Validation failed for contact person`,
      ]);
    }
  };

  const validateLetterOfAppointment = async (appointmentId: string) => {
    try {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

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
        throw new Error(
          "Contact person email must use UAE-hosted domain (.ae)",
        );
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
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, status: "valid", validatedAt: new Date().toISOString() }
            : a,
        ),
      );

      // Update provider credentials
      setProviders((prev) =>
        prev.map((p) =>
          p.providerId === appointment.providerId
            ? {
                ...p,
                credentials: { ...p.credentials, letterOfAppointment: true },
              }
            : p,
        ),
      );
    } catch (error) {
      console.error("Error validating letter of appointment:", error);
      setValidationErrors((prev) => [
        ...prev,
        `Letter of appointment validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);

      // Update appointment status to rejected
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "rejected" } : a,
        ),
      );
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

      if (
        !sanitizedData.name ||
        !sanitizedData.email ||
        !sanitizedData.phone ||
        !sanitizedData.role ||
        !sanitizedData.providerId
      ) {
        throw new Error("All fields are required");
      }

      const newContact: ContactPerson = {
        id: `CP${Date.now()}`,
        ...sanitizedData,
        validated: false,
        uaeEmailCompliant: sanitizedData.email.endsWith(".ae"),
      };

      // Validate JSON structure
      const jsonString = JsonValidator.safeStringify(newContact);
      const validation = JsonValidator.validate(jsonString);

      if (!validation.isValid) {
        throw new Error(
          `Contact person creation failed: ${validation.errors?.join(", ")}`,
        );
      }

      setContactPersons((prev) => [...prev, newContact]);
      setNewContactPerson({
        name: "",
        email: "",
        phone: "",
        role: "",
        providerId: "",
      });
    } catch (error) {
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
        contactPersonName: inputSanitizer.sanitizeText(
          newAppointment.contactPersonName,
          100,
        ).sanitized,
        contactPersonEmail: inputSanitizer.sanitizeText(
          newAppointment.contactPersonEmail,
          100,
        ).sanitized,
        contactPersonPhone: inputSanitizer.sanitizeText(
          newAppointment.contactPersonPhone,
          20,
        ).sanitized,
        validUntil: inputSanitizer.sanitizeText(newAppointment.validUntil, 20)
          .sanitized,
        issuedBy: inputSanitizer.sanitizeText(newAppointment.issuedBy, 100)
          .sanitized,
        digitalSignature: inputSanitizer.sanitizeText(
          newAppointment.digitalSignature,
          200,
        ).sanitized,
      };

      if (
        !sanitizedData.providerId ||
        !sanitizedData.contactPersonName ||
        !sanitizedData.contactPersonEmail ||
        !sanitizedData.validUntil ||
        !sanitizedData.issuedBy
      ) {
        throw new Error("All required fields must be filled");
      }

      const newLOA: LetterOfAppointment = {
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
        throw new Error(
          `Letter of appointment upload failed: ${validation.errors?.join(", ")}`,
        );
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
    } catch (error) {
      console.error("Error uploading letter of appointment:", error);
      setValidationErrors((prev) => [
        ...prev,
        `Failed to upload letter of appointment: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "suspended":
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <Calendar className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading provider authentication data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Authentication Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Enhanced provider authentication with Daman 2025 compliance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadProviderData} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setValidationErrors([])}
            >
              Clear Errors
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="contacts">Contact Persons</TabsTrigger>
          <TabsTrigger value="appointments">Letters of Appointment</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <Card key={provider.providerId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {provider.providerName}
                    </div>
                    <Badge variant={getStatusBadgeVariant(provider.status)}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1">{provider.status}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    License: {provider.licenseNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Specialties
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {provider.contactInfo.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {provider.contactInfo.phone}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Credentials
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Letter of Appointment</span>
                        {provider.credentials.letterOfAppointment ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </div>
                      {provider.credentials.validUntil && (
                        <div className="text-xs text-gray-500 mt-1">
                          Valid until:{" "}
                          {new Date(
                            provider.credentials.validUntil,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactPersons.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      {contact.name}
                    </div>
                    {contact.validated ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validated
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{contact.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span
                          className={
                            !contact.uaeEmailCompliant ? "text-red-600" : ""
                          }
                        >
                          {contact.email}
                        </span>
                        {!contact.uaeEmailCompliant && (
                          <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {contact.phone}
                      </div>
                    </div>

                    {!contact.uaeEmailCompliant && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Email must use UAE-hosted domain (.ae)
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">
                        Provider: {contact.providerId}
                      </span>
                      {!contact.validated && (
                        <Button
                          size="sm"
                          onClick={() => validateContactPerson(contact.id)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Validate
                        </Button>
                      )}
                    </div>

                    {contact.validatedAt && (
                      <div className="text-xs text-gray-500">
                        Validated:{" "}
                        {new Date(contact.validatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Letter of Appointment
                    </div>
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Document ID: {appointment.documentId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Contact Person
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.contactPersonName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {appointment.contactPersonEmail}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {appointment.contactPersonPhone}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Valid Until</div>
                        <div className="font-medium">
                          {new Date(
                            appointment.validUntil,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Issued By</div>
                        <div className="font-medium">
                          {appointment.issuedBy}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Uploaded:{" "}
                      {new Date(appointment.uploadedAt).toLocaleString()}
                      {appointment.validatedAt && (
                        <div>
                          Validated:{" "}
                          {new Date(appointment.validatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {appointment.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          validateLetterOfAppointment(appointment.id)
                        }
                        className="w-full"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Validate Appointment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Add Contact Person
                </CardTitle>
                <CardDescription>
                  Add a new designated contact person for a provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      value={newContactPerson.name}
                      onChange={(e) =>
                        setNewContactPerson((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-email">
                      Email (must end with .ae)
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={newContactPerson.email}
                      onChange={(e) =>
                        setNewContactPerson((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="contact@company.ae"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-phone">Phone Number</Label>
                    <Input
                      id="contact-phone"
                      value={newContactPerson.phone}
                      onChange={(e) =>
                        setNewContactPerson((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+971-50-123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-role">Role</Label>
                    <Input
                      id="contact-role"
                      value={newContactPerson.role}
                      onChange={(e) =>
                        setNewContactPerson((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="Operations Manager"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-provider">Provider ID</Label>
                    <Select
                      value={newContactPerson.providerId}
                      onValueChange={(value) =>
                        setNewContactPerson((prev) => ({
                          ...prev,
                          providerId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem
                            key={provider.providerId}
                            value={provider.providerId}
                          >
                            {provider.providerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addContactPerson} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Add Contact Person
                </Button>
              </CardContent>
            </Card>

            {/* Upload Letter of Appointment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Letter of Appointment
                </CardTitle>
                <CardDescription>
                  Upload and validate a new letter of appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="loa-provider">Provider</Label>
                    <Select
                      value={newAppointment.providerId}
                      onValueChange={(value) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          providerId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem
                            key={provider.providerId}
                            value={provider.providerId}
                          >
                            {provider.providerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="loa-contact-name">
                      Contact Person Name
                    </Label>
                    <Input
                      id="loa-contact-name"
                      value={newAppointment.contactPersonName}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          contactPersonName: e.target.value,
                        }))
                      }
                      placeholder="Contact person full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="loa-contact-email">
                      Contact Person Email
                    </Label>
                    <Input
                      id="loa-contact-email"
                      type="email"
                      value={newAppointment.contactPersonEmail}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          contactPersonEmail: e.target.value,
                        }))
                      }
                      placeholder="contact@company.ae"
                    />
                  </div>

                  <div>
                    <Label htmlFor="loa-contact-phone">
                      Contact Person Phone
                    </Label>
                    <Input
                      id="loa-contact-phone"
                      value={newAppointment.contactPersonPhone}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          contactPersonPhone: e.target.value,
                        }))
                      }
                      placeholder="+971-50-123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="loa-valid-until">Valid Until</Label>
                    <Input
                      id="loa-valid-until"
                      type="date"
                      value={newAppointment.validUntil}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          validUntil: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="loa-issued-by">Issued By</Label>
                    <Input
                      id="loa-issued-by"
                      value={newAppointment.issuedBy}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          issuedBy: e.target.value,
                        }))
                      }
                      placeholder="Daman Insurance"
                    />
                  </div>

                  <div>
                    <Label htmlFor="loa-signature">
                      Digital Signature Hash
                    </Label>
                    <Input
                      id="loa-signature"
                      value={newAppointment.digitalSignature}
                      onChange={(e) =>
                        setNewAppointment((prev) => ({
                          ...prev,
                          digitalSignature: e.target.value,
                        }))
                      }
                      placeholder="Digital signature hash"
                    />
                  </div>
                </div>

                <Button onClick={uploadLetterOfAppointment} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Letter of Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProviderAuthenticationManager;
