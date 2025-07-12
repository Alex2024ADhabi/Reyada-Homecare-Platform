/**
 * Digital Signature Hook
 * Part of P3-002: Electronic Signature System
 *
 * This hook provides an easy way to use the digital signature functionality
 * in React components with enhanced cryptographic features.
 */

import { useState, useEffect } from "react";
import {
  digitalSignatureService,
  DigitalSignature,
  SignaturePayload,
  CertificateDetails,
  SignatureVerificationResult,
  SecurityCheckResult,
} from "@/services/digital-signature.service";

interface UseDigitalSignatureOptions {
  onSignatureCreated?: (signature: DigitalSignature) => void;
  onSignatureVerified?: (result: SignatureVerificationResult) => void;
  onError?: (error: Error) => void;
  autoCertificateRefresh?: boolean;
}

export const useDigitalSignature = (
  options: UseDigitalSignatureOptions = {},
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [currentSignature, setCurrentSignature] =
    useState<DigitalSignature | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<SignatureVerificationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [certificates, setCertificates] = useState<CertificateDetails[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateDetails | null>(null);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheckResult[]>(
    [],
  );

  // P3-002.1.2: User Authentication Integration State
  const [authenticationSession, setAuthenticationSession] = useState<
    string | null
  >(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // P3-002.1.3: Signature Storage System State
  const [storedSignatures, setStoredSignatures] = useState<Map<string, any>>(
    new Map(),
  );
  const [backupStatus, setBackupStatus] = useState<
    "idle" | "backing_up" | "completed" | "failed"
  >("idle");

  // P3-002.2: Signature User Interface State
  const [signatureWorkflow, setSignatureWorkflow] = useState<any>(null);
  const [signatureStatus, setSignatureStatus] = useState<any>(null);
  const [captureRequirements, setCaptureRequirements] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState<number>(1);

  // Load certificates on mount
  useEffect(() => {
    loadCertificates();

    // Set up certificate refresh interval if enabled
    if (options.autoCertificateRefresh) {
      const intervalId = setInterval(
        () => {
          updateCertificateRevocationList();
        },
        30 * 60 * 1000,
      ); // Refresh every 30 minutes

      return () => clearInterval(intervalId);
    }
  }, [options.autoCertificateRefresh]);

  /**
   * Load available certificates
   */
  const loadCertificates = async () => {
    setIsLoadingCertificates(true);
    setError(null);

    try {
      const certs = digitalSignatureService.listCertificates();
      setCertificates(certs);

      // Select the first valid certificate as default
      const validCert = certs.find((cert) => cert.status === "valid");
      if (validCert) {
        setSelectedCertificate(validCert);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load certificates");
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  /**
   * Update certificate revocation list
   */
  const updateCertificateRevocationList = async () => {
    try {
      await digitalSignatureService.updateRevocationList();
      // Refresh certificates after updating revocation list
      await loadCertificates();
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to update certificate revocation list");
      setError(error);
      options.onError?.(error);
    }
  };

  /**
   * Create a digital signature with enhanced cryptographic security
   */
  const createSignature = async (
    payload: SignaturePayload,
  ): Promise<DigitalSignature> => {
    setIsCreating(true);
    setError(null);

    try {
      // Add selected certificate if available
      const enhancedPayload = {
        ...payload,
        certificateId:
          selectedCertificate?.id || payload.certificateId || "doh-cert-001",
      };

      // Use the enhanced async signature creation
      const signature =
        await digitalSignatureService.createSignature(enhancedPayload);
      setCurrentSignature(signature);
      options.onSignatureCreated?.(signature);
      return signature;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create signature");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Verify a digital signature with comprehensive cryptographic validation
   */
  const verifySignature = async (
    signature: DigitalSignature,
    documentHash?: string,
  ): Promise<SignatureVerificationResult> => {
    setIsVerifying(true);
    setError(null);

    try {
      // Use the enhanced async signature verification
      const result = await digitalSignatureService.verifySignature(
        signature,
        documentHash,
      );

      setVerificationResult(result);
      setSecurityChecks(result.securityChecks);

      options.onSignatureVerified?.(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to verify signature");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Generate a document hash
   */
  const generateDocumentHash = (content: string): string => {
    return digitalSignatureService.generateDocumentHash(content);
  };

  /**
   * Check if a user can sign a document
   */
  const canUserSign = (
    userId: string,
    userRole: string,
    documentType: string,
  ): boolean => {
    return digitalSignatureService.canUserSign(userId, userRole, documentType);
  };

  /**
   * Select a certificate for signing
   */
  const selectCertificate = (certificateId: string) => {
    const cert = certificates.find((c) => c.id === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
    }
  };

  /**
   * Verify a certificate's validity
   */
  const verifyCertificate = (certificateId: string): boolean => {
    return digitalSignatureService.verifyCertificate(certificateId);
  };

  /**
   * Get enhanced security metrics for the current session
   */
  const getSecurityMetrics = () => {
    const now = Date.now();
    const expiringSoon = certificates.filter(
      (cert) =>
        cert.validTo - now < 30 * 24 * 60 * 60 * 1000 &&
        cert.status === "valid",
    ).length;

    return {
      certificateCount: certificates.length,
      validCertificates: certificates.filter((cert) => cert.status === "valid")
        .length,
      expiredCertificates: certificates.filter(
        (cert) => cert.status === "expired",
      ).length,
      revokedCertificates: certificates.filter(
        (cert) => cert.status === "revoked",
      ).length,
      expiringSoonCertificates: expiringSoon,
      dohCompliantCertificates: certificates.filter(
        (cert) => cert.type === "doh-certified",
      ).length,
      organizationalCertificates: certificates.filter(
        (cert) => cert.type === "organizational",
      ).length,
      personalCertificates: certificates.filter(
        (cert) => cert.type === "personal",
      ).length,
      deviceCertificates: certificates.filter((cert) => cert.type === "device")
        .length,
      currentSecurityLevel:
        selectedCertificate?.type === "doh-certified"
          ? "doh-compliant"
          : selectedCertificate?.type === "organizational"
            ? "enhanced"
            : "standard",
      selectedCertificateInfo: selectedCertificate
        ? {
            id: selectedCertificate.id,
            type: selectedCertificate.type,
            status: selectedCertificate.status,
            validFrom: new Date(selectedCertificate.validFrom).toISOString(),
            validTo: new Date(selectedCertificate.validTo).toISOString(),
            daysUntilExpiry: Math.ceil(
              (selectedCertificate.validTo - now) / (24 * 60 * 60 * 1000),
            ),
            complianceLevel: selectedCertificate.complianceLevel,
            keySize: selectedCertificate.publicKey.keySize,
            algorithm: selectedCertificate.publicKey.algorithm,
          }
        : null,
      lastVerificationResult: verificationResult,
      securityChecksCount: securityChecks.length,
      passedSecurityChecks: securityChecks.filter((check) => check.passed)
        .length,
      failedSecurityChecks: securityChecks.filter((check) => !check.passed)
        .length,
      overallSecurityScore:
        securityChecks.length > 0
          ? Math.round(
              (securityChecks.filter((check) => check.passed).length /
                securityChecks.length) *
                100,
            )
          : 0,
      lastUpdateTimestamp: new Date().toISOString(),
    };
  };

  /**
   * Validate signature creation requirements
   */
  const validateSignatureRequirements = (
    payload: Partial<SignaturePayload>,
  ) => {
    const requirements = {
      hasDocumentId: !!payload.documentId,
      hasSignerInfo: !!(
        payload.signerUserId &&
        payload.signerName &&
        payload.signerRole
      ),
      hasDocumentHash: !!payload.documentHash,
      hasValidCertificate:
        !!selectedCertificate && selectedCertificate.status === "valid",
      isDohCompliant: selectedCertificate?.type === "doh-certified",
    };

    const isValid = Object.values(requirements).every((req) => req === true);

    return {
      isValid,
      requirements,
      missingRequirements: Object.entries(requirements)
        .filter(([_, value]) => !value)
        .map(([key]) => key),
    };
  };

  // P3-002.1.2: User Authentication Integration Methods

  /**
   * Initiates MFA for signature authentication
   */
  const initiateMFA = async (
    userId: string,
    method: "totp" | "sms" | "email" | "biometric" = "totp",
  ) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await digitalSignatureService.initiateMFA(userId, method);
      setMfaToken(result.tokenId);
      setMfaRequired(true);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("MFA initiation failed");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Verifies MFA token
   */
  const verifyMFA = async (providedToken: string) => {
    if (!mfaToken) {
      throw new Error("No MFA token available");
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const verified = await digitalSignatureService.verifyMFA(
        mfaToken,
        providedToken,
      );
      if (verified) {
        setMfaRequired(false);
      }
      return verified;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("MFA verification failed");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Creates authenticated signature session
   */
  const createSignatureSession = async (
    userId: string,
    userRole: string,
    ipAddress: string,
    deviceFingerprint: string,
  ) => {
    if (!mfaToken) {
      throw new Error("MFA verification required");
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const sessionId = await digitalSignatureService.createSignatureSession(
        userId,
        userRole,
        mfaToken,
        ipAddress,
        deviceFingerprint,
      );
      setAuthenticationSession(sessionId);
      return sessionId;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Session creation failed");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // P3-002.1.3: Signature Storage System Methods

  /**
   * Stores signature with encryption
   */
  const storeSignature = async (signature: DigitalSignature) => {
    setBackupStatus("backing_up");
    setError(null);

    try {
      const storageId = await digitalSignatureService.storeSignature(signature);
      setStoredSignatures((prev) => new Map(prev.set(storageId, signature)));
      setBackupStatus("completed");
      return storageId;
    } catch (err) {
      setBackupStatus("failed");
      const error =
        err instanceof Error ? err : new Error("Signature storage failed");
      setError(error);
      options.onError?.(error);
      throw error;
    }
  };

  /**
   * Retrieves stored signature
   */
  const retrieveSignature = async (
    storageId: string,
    userId: string,
    reason: string,
  ) => {
    setError(null);

    try {
      const signature = await digitalSignatureService.retrieveSignature(
        storageId,
        userId,
        reason,
      );
      return signature;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Signature retrieval failed");
      setError(error);
      options.onError?.(error);
      throw error;
    }
  };

  // P3-002.2: Signature User Interface Methods

  /**
   * Initializes signature workflow
   */
  const initializeWorkflow = (
    documentType: string,
    documentId: string,
    formData?: any,
  ) => {
    setError(null);

    try {
      const workflow = digitalSignatureService.initializeSignatureWorkflow(
        documentType,
        documentId,
        formData,
      );
      setSignatureWorkflow(workflow);
      setWorkflowStep(1);
      return workflow;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Workflow initialization failed");
      setError(error);
      options.onError?.(error);
      throw error;
    }
  };

  /**
   * Processes signature step in workflow
   */
  const processWorkflowStep = async (
    processId: string,
    signatureData: DigitalSignature,
  ) => {
    setError(null);

    try {
      const result = await digitalSignatureService.processSignatureStep(
        processId,
        signatureData,
      );

      if (result.nextStep) {
        setWorkflowStep(result.nextStep);
      }

      // Update signature status
      const status = digitalSignatureService.getSignatureStatus(
        signatureWorkflow?.documentId || "",
      );
      setSignatureStatus(status);

      return result;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Workflow step processing failed");
      setError(error);
      options.onError?.(error);
      throw error;
    }
  };

  /**
   * Validates signature capture
   */
  const validateSignatureCapture = (
    signatureData: any,
    requirements?: {
      minStrokes?: number;
      minDuration?: number;
      minComplexity?: number;
      touchRequired?: boolean;
      pressureRequired?: boolean;
    },
  ) => {
    const defaultRequirements = {
      minStrokes: 5,
      minDuration: 1000,
      minComplexity: 20,
      touchRequired: false,
      pressureRequired: false,
      ...requirements,
    };

    return digitalSignatureService.validateSignatureCapture(
      signatureData,
      defaultRequirements,
    );
  };

  /**
   * Gets current signature status
   */
  const getWorkflowStatus = (documentId: string) => {
    const status = digitalSignatureService.getSignatureStatus(documentId);
    setSignatureStatus(status);
    return status;
  };

  /**
   * Enhanced signature creation with workflow integration
   */
  const createWorkflowSignature = async (
    payload: SignaturePayload,
    workflowProcessId?: string,
  ): Promise<DigitalSignature> => {
    if (!authenticationSession) {
      throw new Error("Authentication session required");
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create signature
      const signature = await createSignature(payload);

      // Store signature
      await storeSignature(signature);

      // Process workflow step if applicable
      if (workflowProcessId) {
        await processWorkflowStep(workflowProcessId, signature);
      }

      return signature;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Workflow signature creation failed");
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // Core signature operations
    createSignature,
    verifySignature,
    generateDocumentHash,
    canUserSign,

    // Certificate management
    loadCertificates,
    updateCertificateRevocationList,
    selectCertificate,
    verifyCertificate,

    // Enhanced security features
    getSecurityMetrics,
    validateSignatureRequirements,

    // P3-002.1.2: User Authentication Integration
    initiateMFA,
    verifyMFA,
    createSignatureSession,
    authenticationSession,
    mfaRequired,
    isAuthenticating,

    // P3-002.1.3: Signature Storage System
    storeSignature,
    retrieveSignature,
    storedSignatures,
    backupStatus,

    // P3-002.2: Signature User Interface
    initializeWorkflow,
    processWorkflowStep,
    validateSignatureCapture,
    getWorkflowStatus,
    createWorkflowSignature,
    signatureWorkflow,
    signatureStatus,
    workflowStep,

    // State management
    isCreating,
    isVerifying,
    isLoadingCertificates,
    currentSignature,
    verificationResult,
    certificates,
    selectedCertificate,
    securityChecks,
    error,
  };
};

export default useDigitalSignature;
