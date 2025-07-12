import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  Clock,
  Send,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OfflineBanner } from "@/components/ui/offline-banner";

// Define the form schema with Zod
const claimFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  episodeId: z.string().min(1, "Episode ID is required"),
  claimType: z.string().min(1, "Claim type is required"),
  billingPeriod: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  }),
  serviceLines: z
    .array(
      z.object({
        serviceCode: z.string().min(1, "Service code is required"),
        serviceDescription: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price must be positive"),
        dateOfService: z.string().min(1, "Date of service is required"),
        providerId: z.string().min(1, "Provider ID is required"),
      }),
    )
    .min(1, "At least one service line is required"),
  documents: z.array(z.string()).min(1, "At least one document is required"),
  notes: z.string().optional(),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

interface ServiceLine {
  id: string;
  serviceCode: string;
  serviceDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  dateOfService: string;
  providerId: string;
  modifiers?: string[];
}

interface ClaimSubmissionFormProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
  onComplete?: (success: boolean) => void;
}

const ClaimSubmissionForm = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline: propIsOffline,
  onComplete,
}: ClaimSubmissionFormProps) => {
  // Using toast from use-toast
  const { isOnline, isSyncing, pendingItems, syncPendingData } =
    useOfflineSync();
  const {
    submitClaim,
    submitBatchClaims,
    updateClaimStatus,
    isLoading,
    error,
  } = useRevenueManagement();

  const isOffline = propIsOffline !== undefined ? propIsOffline : !isOnline;
  const [activeTab, setActiveTab] = useState("claim-details");
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([
    "claim-form",
    "service-log",
  ]);

  // Mock service codes for demonstration
  const serviceCodes = [
    {
      code: "99213",
      description: "Office/outpatient visit, established patient",
    },
    {
      code: "99214",
      description: "Office/outpatient visit, established patient",
    },
    { code: "97110", description: "Therapeutic exercise" },
    { code: "97112", description: "Neuromuscular reeducation" },
    { code: "97140", description: "Manual therapy" },
    {
      code: "G0151",
      description: "Services performed by a qualified physical therapist",
    },
    {
      code: "G0152",
      description: "Services performed by a qualified occupational therapist",
    },
    {
      code: "G0153",
      description:
        "Services performed by a qualified speech-language pathologist",
    },
  ];

  // Initialize the form with default values
  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      patientId,
      episodeId,
      claimType: "",
      billingPeriod: {
        startDate: "",
        endDate: "",
      },
      serviceLines: [],
      documents: selectedDocuments,
      notes: "",
    },
  });

  const addServiceLine = () => {
    const newServiceLine: ServiceLine = {
      id: `service-${Date.now()}`,
      serviceCode: "",
      serviceDescription: "",
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      dateOfService: "",
      providerId: "",
      modifiers: [],
    };
    setServiceLines([...serviceLines, newServiceLine]);
  };

  const removeServiceLine = (id: string) => {
    if (serviceLines.length > 1) {
      setServiceLines(serviceLines.filter((line) => line.id !== id));
    } else {
      toast({
        title: "Cannot remove",
        description: "At least one service line is required",
        variant: "destructive",
      });
    }
  };

  const updateServiceLine = (
    id: string,
    field: keyof ServiceLine,
    value: any,
  ) => {
    setServiceLines(
      serviceLines.map((line) => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedLine.totalAmount =
              updatedLine.quantity * updatedLine.unitPrice;
          }
          return updatedLine;
        }
        return line;
      }),
    );
  };

  const handleDocumentChange = (document: string) => {
    if (selectedDocuments.includes(document)) {
      setSelectedDocuments(selectedDocuments.filter((doc) => doc !== document));
    } else {
      setSelectedDocuments([...selectedDocuments, document]);
    }
    form.setValue("documents", selectedDocuments);
  };

  const calculateTotalAmount = () => {
    return serviceLines.reduce((total, line) => total + line.totalAmount, 0);
  };

  const onSubmit = async (data: ClaimFormValues) => {
    setIsSubmitting(true);

    try {
      // Validate service lines
      if (serviceLines.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one service line.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate required fields for each service line
      const invalidLines = serviceLines.filter(
        (line) =>
          !line.serviceCode ||
          !line.dateOfService ||
          !line.providerId ||
          line.unitPrice <= 0,
      );

      if (invalidLines.length > 0) {
        toast({
          title: "Validation Error",
          description:
            "Please complete all required fields for each service line.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update documents before submission
      data.documents = selectedDocuments;

      // Prepare claim data
      const claimData = {
        ...data,
        serviceLines,
        totalAmount: calculateTotalAmount(),
        submissionDate: new Date().toISOString(),
        submittedBy: localStorage.getItem("user_id") || "unknown",
        facilityDetails: {
          name: "Reyada Homecare",
          licenseNumber: "DOH-HC-2023-001",
          address: "Abu Dhabi, UAE",
        },
        claimMetadata: {
          submissionVersion: "1.0",
          platform: "Reyada Homecare Platform",
          submissionTimestamp: new Date().toISOString(),
        },
      };

      // Submit claim
      const result = await submitClaim(claimData);

      if (result.offlineQueued) {
        toast({
          title: "Claim Queued",
          description:
            "Your claim has been saved and will be submitted when you're back online.",
        });
      } else {
        toast({
          title: "Claim Submitted",
          description: "Your claim has been successfully submitted.",
        });
      }

      setSubmissionSuccess(true);
      if (onComplete) onComplete(true);
    } catch (err: any) {
      console.error("Error submitting claim:", err);
      toast({
        title: "Submission Failed",
        description:
          error ||
          err.message ||
          "There was an error submitting your claim. Please try again.",
        variant: "destructive",
      });
      if (onComplete) onComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setServiceLines([]);
    setSubmissionSuccess(false);
    setSelectedDocuments(["claim-form", "service-log"]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount);
  };

  // Initialize with one service line if empty
  useEffect(() => {
    if (serviceLines.length === 0) {
      addServiceLine();
    }
  }, []);

  return (
    <div className="w-full bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Submit Insurance Claim</h1>
          <p className="text-gray-500">
            Complete the form below to submit a new insurance claim
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "outline"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Patient ID: {patientId}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Episode: {episodeId}
          </Badge>
        </div>
      </div>

      <OfflineBanner
        isOnline={isOnline}
        pendingItems={{
          clinicalForms: pendingItems.clinicalForms,
          patientAssessments: pendingItems.patientAssessments,
          serviceInitiations: pendingItems.serviceInitiations,
        }}
        isSyncing={isSyncing}
        onSyncClick={syncPendingData}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {submissionSuccess ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center text-green-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              Claim Submission Complete
            </CardTitle>
            <CardDescription className="text-center">
              Your claim has been successfully{" "}
              {isOffline ? "saved for later submission" : "submitted"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Claim Details:</p>
              <p className="text-sm">Patient ID: {patientId}</p>
              <p className="text-sm">Episode ID: {episodeId}</p>
              <p className="text-sm">
                Total Amount: {formatCurrency(calculateTotalAmount())}
              </p>
              <p className="text-sm">Service Lines: {serviceLines.length}</p>
              <p className="font-medium mt-2">Submission Date:</p>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleReset}>Submit Another Claim</Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claim-details">
              <FileText className="h-4 w-4 mr-2" />
              Claim Details
            </TabsTrigger>
            <TabsTrigger value="service-lines">
              <DollarSign className="h-4 w-4 mr-2" />
              Service Lines
            </TabsTrigger>
            <TabsTrigger value="review-submit">
              <Send className="h-4 w-4 mr-2" />
              Review & Submit
            </TabsTrigger>
          </TabsList>

          {/* Claim Details Tab */}
          <TabsContent value="claim-details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
                <CardDescription>
                  Enter basic claim details and billing period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="claimType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Claim Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select claim type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="initial">
                                  Initial Claim
                                </SelectItem>
                                <SelectItem value="resubmission">
                                  Resubmission
                                </SelectItem>
                                <SelectItem value="adjustment">
                                  Adjustment
                                </SelectItem>
                                <SelectItem value="void">
                                  Void/Cancel
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingPeriod.startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Period Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingPeriod.endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Period End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Patient Information</Label>
                        <div className="bg-muted p-4 rounded-md space-y-2">
                          <p className="text-sm">
                            <strong>Patient ID:</strong> {patientId}
                          </p>
                          <p className="text-sm">
                            <strong>Episode ID:</strong> {episodeId}
                          </p>
                          <p className="text-sm">
                            <strong>Name:</strong> Mohammed Al Mansoori
                          </p>
                          <p className="text-sm">
                            <strong>Emirates ID:</strong> 784-1985-1234567-8
                          </p>
                          <p className="text-sm">
                            <strong>Insurance:</strong> Daman - Thiqa
                          </p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Submission Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any notes about this claim submission..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional notes for internal reference
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Form>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setActiveTab("service-lines")}>
                  Continue to Service Lines
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Service Lines Tab */}
          <TabsContent value="service-lines" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Service Lines</CardTitle>
                    <CardDescription>
                      Add services provided during the billing period
                    </CardDescription>
                  </div>
                  <Button onClick={addServiceLine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Line
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {serviceLines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No service lines added yet</p>
                    <p className="text-sm">
                      Click "Add Service Line" to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceLines.map((line, index) => (
                      <Card
                        key={line.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              Service Line {index + 1}
                            </CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeServiceLine(line.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Service Code</Label>
                              <Select
                                value={line.serviceCode}
                                onValueChange={(value) => {
                                  updateServiceLine(
                                    line.id,
                                    "serviceCode",
                                    value,
                                  );
                                  const selectedService = serviceCodes.find(
                                    (s) => s.code === value,
                                  );
                                  if (selectedService) {
                                    updateServiceLine(
                                      line.id,
                                      "serviceDescription",
                                      selectedService.description,
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service code" />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviceCodes.map((service) => (
                                    <SelectItem
                                      key={service.code}
                                      value={service.code}
                                    >
                                      {service.code} - {service.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Date of Service</Label>
                              <Input
                                type="date"
                                value={line.dateOfService}
                                onChange={(e) =>
                                  updateServiceLine(
                                    line.id,
                                    "dateOfService",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Provider ID</Label>
                              <Input
                                value={line.providerId}
                                onChange={(e) =>
                                  updateServiceLine(
                                    line.id,
                                    "providerId",
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter provider ID"
                              />
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) =>
                                  updateServiceLine(
                                    line.id,
                                    "quantity",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Unit Price (AED)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.unitPrice}
                                onChange={(e) =>
                                  updateServiceLine(
                                    line.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Total Amount</Label>
                              <Input
                                value={formatCurrency(line.totalAmount)}
                                readOnly
                                className="bg-muted"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Service Description</Label>
                            <Textarea
                              value={line.serviceDescription}
                              onChange={(e) =>
                                updateServiceLine(
                                  line.id,
                                  "serviceDescription",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter service description"
                              className="mt-1"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                            Total Claim Amount:
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(calculateTotalAmount())}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("claim-details")}
                >
                  Back to Claim Details
                </Button>
                <Button
                  onClick={() => setActiveTab("review-submit")}
                  disabled={serviceLines.length === 0}
                >
                  Continue to Review
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Review & Submit Tab */}
          <TabsContent value="review-submit" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Review your claim details before submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Claim Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Claim Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">Basic Information</h4>
                        <p className="text-sm">
                          Claim Type: {form.getValues("claimType")}
                        </p>
                        <p className="text-sm">Patient ID: {patientId}</p>
                        <p className="text-sm">Episode ID: {episodeId}</p>
                        <p className="text-sm">
                          Billing Period:{" "}
                          {form.getValues("billingPeriod.startDate")} to{" "}
                          {form.getValues("billingPeriod.endDate")}
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">Financial Summary</h4>
                        <p className="text-sm">
                          Service Lines: {serviceLines.length}
                        </p>
                        <p className="text-sm">
                          Total Amount: {formatCurrency(calculateTotalAmount())}
                        </p>
                        <p className="text-sm">
                          Submission Date: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Lines Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Service Lines Summary
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceLines.map((line) => (
                            <TableRow key={line.id}>
                              <TableCell className="font-medium">
                                {line.serviceCode}
                              </TableCell>
                              <TableCell>{line.serviceDescription}</TableCell>
                              <TableCell>
                                {new Date(
                                  line.dateOfService,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{line.quantity}</TableCell>
                              <TableCell>
                                {formatCurrency(line.unitPrice)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(line.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={5} className="font-semibold">
                              Total Claim Amount:
                            </TableCell>
                            <TableCell className="font-bold text-lg">
                              {formatCurrency(calculateTotalAmount())}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Required Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="claim-form"
                          checked={selectedDocuments.includes("claim-form")}
                          onCheckedChange={() =>
                            handleDocumentChange("claim-form")
                          }
                        />
                        <label
                          htmlFor="claim-form"
                          className="text-sm font-medium"
                        >
                          Claim Form
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-log"
                          checked={selectedDocuments.includes("service-log")}
                          onCheckedChange={() =>
                            handleDocumentChange("service-log")
                          }
                        />
                        <label
                          htmlFor="service-log"
                          className="text-sm font-medium"
                        >
                          Service Log
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="authorization-letter"
                          checked={selectedDocuments.includes(
                            "authorization-letter",
                          )}
                          onCheckedChange={() =>
                            handleDocumentChange("authorization-letter")
                          }
                        />
                        <label
                          htmlFor="authorization-letter"
                          className="text-sm font-medium"
                        >
                          Authorization Letter
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medical-records"
                          checked={selectedDocuments.includes(
                            "medical-records",
                          )}
                          onCheckedChange={() =>
                            handleDocumentChange("medical-records")
                          }
                        />
                        <label
                          htmlFor="medical-records"
                          className="text-sm font-medium"
                        >
                          Medical Records
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="invoice"
                          checked={selectedDocuments.includes("invoice")}
                          onCheckedChange={() =>
                            handleDocumentChange("invoice")
                          }
                        />
                        <label
                          htmlFor="invoice"
                          className="text-sm font-medium"
                        >
                          Invoice
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prescription"
                          checked={selectedDocuments.includes("prescription")}
                          onCheckedChange={() =>
                            handleDocumentChange("prescription")
                          }
                        />
                        <label
                          htmlFor="prescription"
                          className="text-sm font-medium"
                        >
                          Prescription
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submission Checklist */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Submission Checklist
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={serviceLines.length > 0} />
                        <Label className="text-sm">
                          At least one service line added
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={serviceLines.every(
                            (line) =>
                              line.serviceCode &&
                              line.dateOfService &&
                              line.providerId,
                          )}
                        />
                        <Label className="text-sm">
                          All service lines have required fields completed
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            form.getValues("billingPeriod.startDate") &&
                            form.getValues("billingPeriod.endDate")
                          }
                        />
                        <Label className="text-sm">
                          Billing period specified
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={calculateTotalAmount() > 0} />
                        <Label className="text-sm">
                          Total claim amount is greater than zero
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedDocuments.length > 0} />
                        <Label className="text-sm">
                          Required documents selected
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("service-lines")}
                >
                  Back to Service Lines
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    Reset Form
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={
                      isSubmitting ||
                      serviceLines.length === 0 ||
                      calculateTotalAmount() <= 0
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {isOnline ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" /> Submit Claim
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save for Later
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ClaimSubmissionForm;
