/**
 * Insurance Verification Interface
 * Interface for insurance eligibility verification and claims management
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Search,
  RefreshCw,
  Download,
  Upload,
  Shield,
} from "lucide-react";

import { healthcareIntegrationService } from "@/services/healthcare-integration.service";

interface InsurancePolicy {
  policyNumber: string;
  membershipId: string;
  insuranceProvider: string;
  policyType: string;
  status: "active" | "inactive" | "suspended";
  effectiveDate: string;
  expiryDate: string;
  coverageDetails: {
    homecareServices: boolean;
    maxAmount: number;
    deductible: number;
    copayment: number;
  };
}

interface Claim {
  claimId: string;
  patientId: string;
  serviceDate: string;
  serviceType: string;
  amount: number;
  status: "submitted" | "processing" | "approved" | "denied" | "paid";
  submissionDate: string;
  processingNotes?: string;
}

const InsuranceVerificationInterface: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [verificationForm, setVerificationForm] = useState({
    patientId: "",
    policyNumber: "",
    membershipId: "",
    insuranceProvider: "",
  });
  const [claimForm, setClaimForm] = useState({
    patientId: "",
    serviceDate: "",
    serviceType: "",
    serviceCode: "",
    amount: "",
    providerId: "",
    diagnosis: "",
    treatmentDetails: "",
  });

  useEffect(() => {
    loadInsuranceData();
  }, []);

  const loadInsuranceData = async () => {
    try {
      setLoading(true);
      // Simulate loading insurance data
      const mockPolicies: InsurancePolicy[] = [
        {
          policyNumber: "POL-2024-001",
          membershipId: "MEM-123456",
          insuranceProvider: "Emirates Insurance",
          policyType: "Comprehensive Health",
          status: "active",
          effectiveDate: "2024-01-01",
          expiryDate: "2024-12-31",
          coverageDetails: {
            homecareServices: true,
            maxAmount: 50000,
            deductible: 500,
            copayment: 20,
          },
        },
        {
          policyNumber: "POL-2024-002",
          membershipId: "MEM-789012",
          insuranceProvider: "Dubai Insurance",
          policyType: "Basic Health",
          status: "active",
          effectiveDate: "2024-03-01",
          expiryDate: "2025-02-28",
          coverageDetails: {
            homecareServices: true,
            maxAmount: 25000,
            deductible: 1000,
            copayment: 30,
          },
        },
      ];

      const mockClaims: Claim[] = [
        {
          claimId: "CLM-2024-001",
          patientId: "784-1990-1234567-1",
          serviceDate: "2024-12-15",
          serviceType: "Home Nursing",
          amount: 1500,
          status: "approved",
          submissionDate: "2024-12-16",
          processingNotes: "Approved for home nursing services",
        },
        {
          claimId: "CLM-2024-002",
          patientId: "784-1985-2345678-2",
          serviceDate: "2024-12-18",
          serviceType: "Physiotherapy",
          amount: 800,
          status: "processing",
          submissionDate: "2024-12-19",
        },
      ];

      setPolicies(mockPolicies);
      setClaims(mockClaims);
    } catch (error) {
      console.error("Error loading insurance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyInsurance = async () => {
    try {
      setLoading(true);
      const result =
        await healthcareIntegrationService.verifyInsuranceEligibility(
          verificationForm.patientId,
          {
            policyNumber: verificationForm.policyNumber,
            membershipId: verificationForm.membershipId,
            insuranceProvider: verificationForm.insuranceProvider,
          },
        );

      if (result) {
        console.log("Insurance verification successful:", result);
        await loadInsuranceData();
      }
    } catch (error) {
      console.error("Error verifying insurance:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitClaim = async () => {
    try {
      setLoading(true);
      const result = await healthcareIntegrationService.submitInsuranceClaim(
        claimForm.patientId,
        {
          serviceDate: claimForm.serviceDate,
          serviceType: claimForm.serviceType,
          serviceCode: claimForm.serviceCode,
          amount: parseFloat(claimForm.amount),
          providerId: claimForm.providerId,
          diagnosis: claimForm.diagnosis,
          treatmentDetails: claimForm.treatmentDetails,
        },
      );

      if (result.success) {
        console.log("Claim submitted successfully:", result);
        await loadInsuranceData();
        // Reset form
        setClaimForm({
          patientId: "",
          serviceDate: "",
          serviceType: "",
          serviceCode: "",
          amount: "",
          providerId: "",
          diagnosis: "",
          treatmentDetails: "",
        });
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
      case "paid":
        return "text-green-600 bg-green-100";
      case "processing":
      case "submitted":
        return "text-blue-600 bg-blue-100";
      case "denied":
        return "text-red-600 bg-red-100";
      case "inactive":
      case "suspended":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insurance Verification Interface
          </h1>
          <p className="text-gray-600">
            Manage insurance eligibility verification and claims processing
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Policies
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {policies.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Claims
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      claims.filter(
                        (c) =>
                          c.status === "processing" || c.status === "submitted",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Approved Claims
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      claims.filter(
                        (c) => c.status === "approved" || c.status === "paid",
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    AED{" "}
                    {claims
                      .reduce((sum, claim) => sum + claim.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="submit-claim">Submit Claim</TabsTrigger>
          </TabsList>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Insurance Eligibility Verification</span>
                </CardTitle>
                <CardDescription>
                  Verify patient insurance eligibility for homecare services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient-id">
                        Patient ID (Emirates ID)
                      </Label>
                      <Input
                        id="patient-id"
                        value={verificationForm.patientId}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            patientId: e.target.value,
                          }))
                        }
                        placeholder="784-YYYY-XXXXXXX-X"
                      />
                    </div>
                    <div>
                      <Label htmlFor="policy-number">Policy Number</Label>
                      <Input
                        id="policy-number"
                        value={verificationForm.policyNumber}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            policyNumber: e.target.value,
                          }))
                        }
                        placeholder="POL-2024-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="membership-id">Membership ID</Label>
                      <Input
                        id="membership-id"
                        value={verificationForm.membershipId}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            membershipId: e.target.value,
                          }))
                        }
                        placeholder="MEM-123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurance-provider">
                        Insurance Provider
                      </Label>
                      <Select
                        value={verificationForm.insuranceProvider}
                        onValueChange={(value) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            insuranceProvider: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emirates-insurance">
                            Emirates Insurance
                          </SelectItem>
                          <SelectItem value="dubai-insurance">
                            Dubai Insurance
                          </SelectItem>
                          <SelectItem value="abu-dhabi-national">
                            Abu Dhabi National Insurance
                          </SelectItem>
                          <SelectItem value="oman-insurance">
                            Oman Insurance
                          </SelectItem>
                          <SelectItem value="orient-insurance">
                            Orient Insurance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={verifyInsurance}
                      disabled={
                        loading ||
                        !verificationForm.patientId ||
                        !verificationForm.policyNumber
                      }
                      className="w-full"
                    >
                      <Search
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                      />
                      Verify Insurance
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Verification Results</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Real-time eligibility verification</p>
                      <p>• Coverage details and limitations</p>
                      <p>• Pre-authorization requirements</p>
                      <p>• Deductible and copayment information</p>
                      <p>• Service-specific coverage</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Insurance Policies</span>
                    </CardTitle>
                    <CardDescription>
                      Active insurance policies and coverage details
                    </CardDescription>
                  </div>
                  <Button onClick={loadInsuranceData} disabled={loading}>
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div
                      key={policy.policyNumber}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">
                            {policy.insuranceProvider}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {policy.policyType}
                          </p>
                        </div>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Policy Number</p>
                          <p className="font-medium">{policy.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Membership ID</p>
                          <p className="font-medium">{policy.membershipId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Max Coverage</p>
                          <p className="font-medium">
                            AED{" "}
                            {policy.coverageDetails.maxAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Deductible</p>
                          <p className="font-medium">
                            AED {policy.coverageDetails.deductible}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Valid:{" "}
                          {new Date(policy.effectiveDate).toLocaleDateString()}{" "}
                          - {new Date(policy.expiryDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          {policy.coverageDetails.homecareServices && (
                            <Badge variant="outline">Homecare Covered</Badge>
                          )}
                          <span className="text-gray-600">
                            Copay: {policy.coverageDetails.copayment}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Insurance Claims</span>
                </CardTitle>
                <CardDescription>
                  Track submitted claims and their processing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.claimId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">
                            Claim ID: {claim.claimId}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {claim.serviceType}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                          <span className="font-medium">
                            AED {claim.amount}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Patient ID</p>
                          <p className="font-medium">{claim.patientId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Service Date</p>
                          <p className="font-medium">
                            {new Date(claim.serviceDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Submitted</p>
                          <p className="font-medium">
                            {new Date(
                              claim.submissionDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-medium">AED {claim.amount}</p>
                        </div>
                      </div>

                      {claim.processingNotes && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">
                            {claim.processingNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Claim Tab */}
          <TabsContent value="submit-claim">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Submit New Claim</span>
                </CardTitle>
                <CardDescription>
                  Submit a new insurance claim for homecare services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="claim-patient-id">Patient ID</Label>
                      <Input
                        id="claim-patient-id"
                        value={claimForm.patientId}
                        onChange={(e) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            patientId: e.target.value,
                          }))
                        }
                        placeholder="784-YYYY-XXXXXXX-X"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="service-date">Service Date</Label>
                        <Input
                          id="service-date"
                          type="date"
                          value={claimForm.serviceDate}
                          onChange={(e) =>
                            setClaimForm((prev) => ({
                              ...prev,
                              serviceDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount (AED)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={claimForm.amount}
                          onChange={(e) =>
                            setClaimForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="1500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="service-type">Service Type</Label>
                      <Select
                        value={claimForm.serviceType}
                        onValueChange={(value) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            serviceType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home-nursing">
                            Home Nursing
                          </SelectItem>
                          <SelectItem value="physiotherapy">
                            Physiotherapy
                          </SelectItem>
                          <SelectItem value="wound-care">Wound Care</SelectItem>
                          <SelectItem value="medication-management">
                            Medication Management
                          </SelectItem>
                          <SelectItem value="chronic-care">
                            Chronic Care Management
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="service-code">Service Code</Label>
                        <Input
                          id="service-code"
                          value={claimForm.serviceCode}
                          onChange={(e) =>
                            setClaimForm((prev) => ({
                              ...prev,
                              serviceCode: e.target.value,
                            }))
                          }
                          placeholder="HC001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider-id">Provider ID</Label>
                        <Input
                          id="provider-id"
                          value={claimForm.providerId}
                          onChange={(e) =>
                            setClaimForm((prev) => ({
                              ...prev,
                              providerId: e.target.value,
                            }))
                          }
                          placeholder="PROV-001"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={claimForm.diagnosis}
                        onChange={(e) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            diagnosis: e.target.value,
                          }))
                        }
                        placeholder="Primary diagnosis code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatment-details">
                        Treatment Details
                      </Label>
                      <Textarea
                        id="treatment-details"
                        value={claimForm.treatmentDetails}
                        onChange={(e) =>
                          setClaimForm((prev) => ({
                            ...prev,
                            treatmentDetails: e.target.value,
                          }))
                        }
                        placeholder="Detailed description of treatment provided..."
                        rows={6}
                      />
                    </div>
                    <Button
                      onClick={submitClaim}
                      disabled={
                        loading || !claimForm.patientId || !claimForm.amount
                      }
                      className="w-full"
                    >
                      <Upload
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                      />
                      Submit Claim
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InsuranceVerificationInterface;
