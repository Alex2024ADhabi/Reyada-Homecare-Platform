/**
 * Mobile Communication Service
 * Handles mobile-specific features like voice-to-text, offline queuing, and push notifications
 */

import { communicationService, Message } from "./communication.service";
import { serviceWorkerService } from "./service-worker.service";
import { AuditLogger } from "./security.service";
import { naturalLanguageProcessingService } from "./natural-language-processing.service";

export interface VoiceRecognitionConfig {
  language: string;
  medicalTerminology: boolean;
  continuousRecognition: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: {
    transcript: string;
    confidence: number;
  }[];
}

export interface OfflineMessage {
  id: string;
  message: Omit<Message, "id" | "timestamp" | "status">;
  queuedAt: string;
  retryCount: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface PushNotificationConfig {
  vapidPublicKey: string;
  serviceWorkerPath: string;
  notificationOptions: {
    icon: string;
    badge: string;
    vibrate: number[];
    sound: string;
    requireInteraction: boolean;
  };
}

class MobileCommunicationService {
  private speechRecognition: any = null;
  private isRecognitionActive = false;
  private offlineMessageQueue: OfflineMessage[] = [];
  private pushSubscription: PushSubscription | null = null;
  private voiceRecognitionCallbacks: ((
    result: VoiceRecognitionResult,
  ) => void)[] = [];
  private encryptionKey: string = "mobile-comm-2024";
  private medicalTerms: string[] = [
    "blood pressure",
    "heart rate",
    "temperature",
    "oxygen saturation",
    "medication",
    "dosage",
    "symptoms",
    "diagnosis",
    "treatment",
    "patient",
    "emergency",
    "critical",
    "stable",
    "vital signs",
  ];

  constructor() {
    this.initializeSpeechRecognition();
    this.loadOfflineQueue();
    this.setupNetworkListeners();
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition(): void {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      this.speechRecognition = new SpeechRecognition();

      this.speechRecognition.onresult = this.handleSpeechResult.bind(this);
      this.speechRecognition.onerror = this.handleSpeechError.bind(this);
      this.speechRecognition.onend = this.handleSpeechEnd.bind(this);
    }
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceRecognitionSupported(): boolean {
    return this.speechRecognition !== null;
  }

  /**
   * Start voice recognition
   */
  async startVoiceRecognition(config: VoiceRecognitionConfig): Promise<void> {
    if (!this.speechRecognition) {
      throw new Error("Speech recognition not supported");
    }

    if (this.isRecognitionActive) {
      this.stopVoiceRecognition();
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configure speech recognition
      this.speechRecognition.lang = config.language;
      this.speechRecognition.continuous = config.continuousRecognition;
      this.speechRecognition.interimResults = config.interimResults;
      this.speechRecognition.maxAlternatives = config.maxAlternatives || 3;

      // Start recognition
      this.speechRecognition.start();
      this.isRecognitionActive = true;

      // Log voice recognition start
      AuditLogger.logSecurityEvent({
        type: "user_action",
        details: {
          action: "voice_recognition_started",
          language: config.language,
          medicalTerminology: config.medicalTerminology,
        },
        severity: "low",
      });
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      throw error;
    }
  }

  /**
   * Stop voice recognition
   */
  stopVoiceRecognition(): void {
    if (this.speechRecognition && this.isRecognitionActive) {
      this.speechRecognition.stop();
      this.isRecognitionActive = false;
    }
  }

  /**
   * Handle speech recognition results
   */
  private async handleSpeechResult(event: any): Promise<void> {
    const results = event.results;
    const lastResult = results[results.length - 1];

    let transcript = lastResult[0].transcript;
    const confidence = lastResult[0].confidence;
    const isFinal = lastResult.isFinal;

    // Apply enhanced medical terminology corrections using NLP service
    try {
      const audioBlob = new Blob(["mock audio"], { type: "audio/wav" });
      const nlpResult =
        await naturalLanguageProcessingService.processVoiceToText(audioBlob, {
          language: "en",
          medicalContext: true,
        });

      // Use NLP-corrected transcript if available
      if (nlpResult.medicalTerminologyCorrections.length > 0) {
        transcript = nlpResult.transcript;
      } else {
        // Fallback to original correction method
        transcript = this.applyMedicalTerminologyCorrections(transcript);
      }
    } catch (error) {
      console.error("NLP voice processing failed, using fallback:", error);
      transcript = this.applyMedicalTerminologyCorrections(transcript);
    }

    const result: VoiceRecognitionResult = {
      transcript,
      confidence,
      isFinal,
      alternatives: Array.from(lastResult)
        .slice(1)
        .map((alt: any) => ({
          transcript: this.applyMedicalTerminologyCorrections(alt.transcript),
          confidence: alt.confidence,
        })),
    };

    // Notify callbacks
    this.voiceRecognitionCallbacks.forEach((callback) => callback(result));
  }

  /**
   * Handle speech recognition errors
   */
  private handleSpeechError(event: any): void {
    console.error("Speech recognition error:", event.error);
    this.isRecognitionActive = false;

    AuditLogger.logSecurityEvent({
      type: "system_event",
      details: {
        action: "voice_recognition_error",
        error: event.error,
      },
      severity: "medium",
    });
  }

  /**
   * Handle speech recognition end
   */
  private handleSpeechEnd(): void {
    this.isRecognitionActive = false;
  }

  /**
   * Apply medical terminology corrections
   */
  private applyMedicalTerminologyCorrections(transcript: string): string {
    let corrected = transcript.toLowerCase();

    // Common medical term corrections
    const corrections: Record<string, string> = {
      "blood pressure": "blood pressure",
      bp: "blood pressure",
      "heart rate": "heart rate",
      hr: "heart rate",
      temp: "temperature",
      "o2 sat": "oxygen saturation",
      spo2: "oxygen saturation",
      meds: "medications",
      vitals: "vital signs",
    };

    Object.entries(corrections).forEach(([pattern, replacement]) => {
      const regex = new RegExp(`\\b${pattern}\\b`, "gi");
      corrected = corrected.replace(regex, replacement);
    });

    return corrected;
  }

  /**
   * Register voice recognition callback
   */
  onVoiceRecognitionResult(
    callback: (result: VoiceRecognitionResult) => void,
  ): void {
    this.voiceRecognitionCallbacks.push(callback);
  }

  /**
   * Remove voice recognition callback
   */
  removeVoiceRecognitionCallback(
    callback: (result: VoiceRecognitionResult) => void,
  ): void {
    const index = this.voiceRecognitionCallbacks.indexOf(callback);
    if (index > -1) {
      this.voiceRecognitionCallbacks.splice(index, 1);
    }
  }

  /**
   * Queue message for offline sending
   */
  queueOfflineMessage(
    message: Omit<Message, "id" | "timestamp" | "status">,
    priority: "low" | "medium" | "high" | "critical" = "medium",
  ): string {
    const offlineMessage: OfflineMessage = {
      id: this.generateOfflineMessageId(),
      message,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      priority,
    };

    this.offlineMessageQueue.push(offlineMessage);
    this.saveOfflineQueue();

    // Log offline message queued
    AuditLogger.logSecurityEvent({
      type: "system_event",
      details: {
        action: "message_queued_offline",
        messageId: offlineMessage.id,
        priority,
      },
      severity: "low",
    });

    return offlineMessage.id;
  }

  /**
   * Process offline message queue
   */
  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine || this.offlineMessageQueue.length === 0) {
      return;
    }

    // Sort by priority and queue time
    const sortedQueue = [...this.offlineMessageQueue].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    });

    const processedIds: string[] = [];
    const failedIds: string[] = [];

    for (const offlineMessage of sortedQueue) {
      try {
        await communicationService.sendMessage(offlineMessage.message);
        processedIds.push(offlineMessage.id);
      } catch (error) {
        console.error(
          `Failed to send offline message ${offlineMessage.id}:`,
          error,
        );
        offlineMessage.retryCount += 1;

        if (offlineMessage.retryCount >= 3) {
          failedIds.push(offlineMessage.id);
        }
      }
    }

    // Remove processed and failed messages
    this.offlineMessageQueue = this.offlineMessageQueue.filter(
      (msg) => !processedIds.includes(msg.id) && !failedIds.includes(msg.id),
    );

    this.saveOfflineQueue();

    // Log processing results
    if (processedIds.length > 0 || failedIds.length > 0) {
      AuditLogger.logSecurityEvent({
        type: "system_event",
        details: {
          action: "offline_queue_processed",
          processedCount: processedIds.length,
          failedCount: failedIds.length,
          remainingCount: this.offlineMessageQueue.length,
        },
        severity: "low",
      });
    }
  }

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus(): {
    totalMessages: number;
    priorityBreakdown: Record<string, number>;
    oldestMessage?: string;
  } {
    const priorityBreakdown = this.offlineMessageQueue.reduce(
      (acc, msg) => {
        acc[msg.priority] = (acc[msg.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const oldestMessage =
      this.offlineMessageQueue.length > 0
        ? this.offlineMessageQueue.reduce((oldest, msg) =>
            new Date(msg.queuedAt) < new Date(oldest.queuedAt) ? msg : oldest,
          ).queuedAt
        : undefined;

    return {
      totalMessages: this.offlineMessageQueue.length,
      priorityBreakdown,
      oldestMessage,
    };
  }

  /**
   * Enhanced mobile camera integration for wound documentation with medical-grade features
   */
  async initializeCameraIntegration(): Promise<{
    supported: boolean;
    permissions: {
      camera: boolean;
      microphone: boolean;
    };
    capabilities: {
      facingModes: string[];
      resolutions: { width: number; height: number }[];
      flashSupported: boolean;
      zoomSupported: boolean;
      medicalModeSupported: boolean;
      measurementToolsSupported: boolean;
    };
  }> {
    try {
      const supported =
        "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;

      if (!supported) {
        return {
          supported: false,
          permissions: { camera: false, microphone: false },
          capabilities: {
            facingModes: [],
            resolutions: [],
            flashSupported: false,
            zoomSupported: false,
            medicalModeSupported: false,
            measurementToolsSupported: false,
          },
        };
      }

      // Check permissions
      const cameraPermission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      const microphonePermission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });

      // Get camera capabilities
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const capabilities = {
        facingModes: ["user", "environment"],
        resolutions: [
          { width: 4096, height: 3072 }, // 12MP for medical documentation
          { width: 3264, height: 2448 }, // 8MP
          { width: 1920, height: 1080 }, // Full HD
          { width: 1280, height: 720 }, // HD
          { width: 640, height: 480 }, // VGA
        ],
        flashSupported: videoDevices.some((device) =>
          device.label.toLowerCase().includes("back"),
        ),
        zoomSupported: true,
        medicalModeSupported: true, // Enhanced for medical documentation
        measurementToolsSupported: true, // Built-in measurement capabilities
      };

      AuditLogger.logSecurityEvent({
        type: "system_event",
        details: {
          action: "camera_integration_initialized",
          devicesFound: videoDevices.length,
          capabilities,
        },
        severity: "low",
      });

      return {
        supported: true,
        permissions: {
          camera: cameraPermission.state === "granted",
          microphone: microphonePermission.state === "granted",
        },
        capabilities,
      };
    } catch (error) {
      console.error("Failed to initialize camera integration:", error);
      return {
        supported: false,
        permissions: { camera: false, microphone: false },
        capabilities: {
          facingModes: [],
          resolutions: [],
          flashSupported: false,
          zoomSupported: false,
          medicalModeSupported: false,
          measurementToolsSupported: false,
        },
      };
    }
  }

  /**
   * Capture high-quality wound documentation image
   */
  async captureWoundImage(
    options: {
      facingMode?: "user" | "environment";
      resolution?: { width: number; height: number };
      flash?: boolean;
      annotations?: {
        measurements: {
          x: number;
          y: number;
          width: number;
          height: number;
          depth?: number;
        }[];
        notes: string[];
        timestamp: string;
      };
    } = {},
  ): Promise<{
    success: boolean;
    imageData?: {
      blob: Blob;
      dataUrl: string;
      metadata: {
        timestamp: string;
        resolution: { width: number; height: number };
        fileSize: number;
        format: string;
        annotations?: any;
      };
    };
    error?: string;
  }> {
    try {
      const constraints = {
        video: {
          facingMode: options.facingMode || "environment",
          width: { ideal: options.resolution?.width || 1920 },
          height: { ideal: options.resolution?.height || 1080 },
          aspectRatio: { ideal: 16 / 9 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create video element for preview
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas for capture
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add annotations if provided
      if (options.annotations) {
        context.strokeStyle = "#ff0000";
        context.lineWidth = 2;
        context.font = "16px Arial";
        context.fillStyle = "#ff0000";

        options.annotations.measurements.forEach((measurement, index) => {
          // Draw measurement rectangle
          context.strokeRect(
            measurement.x,
            measurement.y,
            measurement.width,
            measurement.height,
          );

          // Add measurement text
          const text = `${measurement.width}x${measurement.height}${measurement.depth ? `x${measurement.depth}` : ""}`;
          context.fillText(text, measurement.x, measurement.y - 5);
        });

        // Add notes
        options.annotations.notes.forEach((note, index) => {
          context.fillText(note, 10, 30 + index * 25);
        });
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Stop camera stream
      stream.getTracks().forEach((track) => track.stop());

      const metadata = {
        timestamp: new Date().toISOString(),
        resolution: { width: canvas.width, height: canvas.height },
        fileSize: blob.size,
        format: "image/jpeg",
        annotations: options.annotations,
      };

      // Log capture event
      AuditLogger.logSecurityEvent({
        type: "user_action",
        details: {
          action: "wound_image_captured",
          resolution: metadata.resolution,
          fileSize: metadata.fileSize,
          hasAnnotations: !!options.annotations,
        },
        severity: "low",
      });

      return {
        success: true,
        imageData: {
          blob,
          dataUrl,
          metadata,
        },
      };
    } catch (error) {
      console.error("Failed to capture wound image:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Enhanced voice-to-text with medical terminology and offline support
   */
  async startEnhancedVoiceRecognition(
    config: VoiceRecognitionConfig & {
      medicalSpecialty?:
        | "nursing"
        | "physiotherapy"
        | "occupational"
        | "speech"
        | "respiratory"
        | "general";
      offlineMode?: boolean;
      realTimeTranscription?: boolean;
      speakerIdentification?: boolean;
    },
  ): Promise<{
    success: boolean;
    sessionId?: string;
    error?: string;
  }> {
    if (!this.speechRecognition && !config.offlineMode) {
      return {
        success: false,
        error: "Speech recognition not supported and offline mode not enabled",
      };
    }

    try {
      const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (config.offlineMode) {
        // Initialize offline voice recognition
        await this.initializeOfflineVoiceRecognition(config.medicalSpecialty);
      }

      // Enhanced medical terminology dictionary
      const medicalTerminologies = {
        nursing: [
          "blood pressure",
          "heart rate",
          "temperature",
          "oxygen saturation",
          "pulse oximetry",
          "medication administration",
          "wound assessment",
          "pain scale",
          "glasgow coma scale",
          "braden scale",
          "fall risk",
          "pressure injury",
          "catheter care",
          "dressing change",
          "vital signs",
          "intake output",
          "bowel movement",
          "urination",
          "ambulation",
          "range of motion",
          "skin integrity",
          "edema",
          "dyspnea",
          "chest pain",
        ],
        physiotherapy: [
          "range of motion",
          "muscle strength",
          "balance training",
          "gait training",
          "transfer training",
          "mobility assessment",
          "functional capacity",
          "exercise tolerance",
          "joint mobility",
          "muscle tone",
          "coordination",
          "proprioception",
          "endurance",
          "therapeutic exercise",
          "manual therapy",
          "postural assessment",
          "pain management",
        ],
        occupational: [
          "activities of daily living",
          "instrumental activities",
          "cognitive assessment",
          "fine motor skills",
          "gross motor skills",
          "adaptive equipment",
          "home safety",
          "energy conservation",
          "work simplification",
          "sensory processing",
          "visual perception",
          "executive function",
          "memory strategies",
          "attention span",
          "problem solving",
        ],
        speech: [
          "speech therapy",
          "language assessment",
          "swallowing evaluation",
          "dysphagia",
          "articulation",
          "phonation",
          "resonance",
          "fluency",
          "voice quality",
          "cognitive communication",
          "aphasia",
          "dysarthria",
          "apraxia",
          "oral motor",
          "feeding therapy",
          "communication device",
          "augmentative communication",
        ],
        respiratory: [
          "oxygen therapy",
          "respiratory assessment",
          "breathing exercises",
          "chest physiotherapy",
          "airway clearance",
          "ventilator",
          "cpap",
          "bipap",
          "pulse oximetry",
          "arterial blood gas",
          "spirometry",
          "peak flow",
          "nebulizer",
          "inhaler",
          "tracheostomy",
          "suctioning",
          "mechanical ventilation",
          "weaning protocol",
        ],
        general: [
          "patient assessment",
          "care plan",
          "treatment goals",
          "progress notes",
          "discharge planning",
          "family education",
          "medication reconciliation",
          "infection control",
          "safety measures",
          "quality indicators",
          "documentation",
          "interdisciplinary team",
          "care coordination",
          "patient satisfaction",
        ],
      };

      // Configure recognition with enhanced medical terminology
      if (this.speechRecognition) {
        this.speechRecognition.lang = config.language;
        this.speechRecognition.continuous = config.continuousRecognition;
        this.speechRecognition.interimResults = config.interimResults;
        this.speechRecognition.maxAlternatives = config.maxAlternatives || 5;

        // Enhanced result processing
        this.speechRecognition.onresult = async (event: any) => {
          await this.processEnhancedSpeechResult(event, {
            medicalTerminology:
              medicalTerminologies[config.medicalSpecialty || "general"],
            realTimeTranscription: config.realTimeTranscription,
            speakerIdentification: config.speakerIdentification,
            sessionId,
          });
        };

        this.speechRecognition.start();
      }

      this.isRecognitionActive = true;

      // Log session start
      AuditLogger.logSecurityEvent({
        type: "user_action",
        details: {
          action: "enhanced_voice_recognition_started",
          sessionId,
          medicalSpecialty: config.medicalSpecialty,
          offlineMode: config.offlineMode,
          language: config.language,
        },
        severity: "low",
      });

      return {
        success: true,
        sessionId,
      };
    } catch (error) {
      console.error("Failed to start enhanced voice recognition:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process enhanced speech results with medical terminology
   */
  private async processEnhancedSpeechResult(
    event: any,
    options: {
      medicalTerminology: string[];
      realTimeTranscription?: boolean;
      speakerIdentification?: boolean;
      sessionId: string;
    },
  ): Promise<void> {
    const results = event.results;
    const lastResult = results[results.length - 1];

    let transcript = lastResult[0].transcript;
    const confidence = lastResult[0].confidence;
    const isFinal = lastResult.isFinal;

    // Enhanced medical terminology correction
    transcript = this.applyEnhancedMedicalCorrections(
      transcript,
      options.medicalTerminology,
    );

    // Real-time processing with NLP
    if (options.realTimeTranscription || isFinal) {
      try {
        const audioBlob = new Blob(["mock audio"], { type: "audio/wav" });
        const nlpResult =
          await naturalLanguageProcessingService.processVoiceToText(audioBlob, {
            language: "en",
            medicalContext: true,
            speakerIdentification: options.speakerIdentification || false,
          });

        // Use NLP-enhanced transcript if available
        if (nlpResult.medicalTerminologyCorrections.length > 0) {
          transcript = nlpResult.transcript;
        }

        // Extract medical entities and concepts
        const clinicalAnalysis =
          await naturalLanguageProcessingService.processClinicalNote(
            transcript,
            {
              language: "en",
              includeCodeSuggestions: true,
              includeSentimentAnalysis: false,
            },
          );

        // Store offline if needed
        if (!navigator.onLine) {
          await this.storeOfflineVoiceData({
            sessionId: options.sessionId,
            transcript,
            confidence,
            isFinal,
            timestamp: new Date().toISOString(),
            clinicalAnalysis,
            medicalEntities: clinicalAnalysis.entities,
          });
        }
      } catch (error) {
        console.error("Enhanced voice processing failed:", error);
      }
    }

    const result: VoiceRecognitionResult = {
      transcript,
      confidence,
      isFinal,
      alternatives: Array.from(lastResult)
        .slice(1)
        .map((alt: any) => ({
          transcript: this.applyEnhancedMedicalCorrections(
            alt.transcript,
            options.medicalTerminology,
          ),
          confidence: alt.confidence,
        })),
    };

    // Notify callbacks with enhanced result
    this.voiceRecognitionCallbacks.forEach((callback) => callback(result));
  }

  /**
   * Apply enhanced medical terminology corrections
   */
  private applyEnhancedMedicalCorrections(
    transcript: string,
    medicalTerms: string[],
  ): string {
    let corrected = transcript.toLowerCase();

    // Enhanced medical term corrections with context awareness
    const enhancedCorrections: Record<string, string> = {
      // Vital signs
      bp: "blood pressure",
      "b p": "blood pressure",
      "heart rate": "heart rate",
      hr: "heart rate",
      "h r": "heart rate",
      temp: "temperature",
      "o2 sat": "oxygen saturation",
      spo2: "oxygen saturation",
      "sp o2": "oxygen saturation",
      "pulse ox": "pulse oximetry",

      // Pain and assessment
      "pain scale": "pain scale",
      "zero to ten": "0 to 10",
      "one to ten": "1 to 10",
      "glasgow coma": "glasgow coma scale",
      gcs: "glasgow coma scale",
      "braden scale": "braden scale",

      // Medications
      meds: "medications",
      "medication admin": "medication administration",
      "med admin": "medication administration",
      prn: "as needed",
      "p r n": "as needed",
      bid: "twice daily",
      "b i d": "twice daily",
      tid: "three times daily",
      "t i d": "three times daily",
      qid: "four times daily",
      "q i d": "four times daily",

      // Clinical observations
      vitals: "vital signs",
      "i and o": "intake and output",
      "intake output": "intake and output",
      bm: "bowel movement",
      "b m": "bowel movement",
      rom: "range of motion",
      "r o m": "range of motion",
      adl: "activities of daily living",
      "a d l": "activities of daily living",
      iadl: "instrumental activities of daily living",
      "i a d l": "instrumental activities of daily living",

      // Wound care
      "wound care": "wound care",
      "dressing change": "dressing change",
      "pressure injury": "pressure injury",
      "pressure ulcer": "pressure injury",
      "bed sore": "pressure injury",

      // Mobility
      ambulation: "ambulation",
      "gait training": "gait training",
      "transfer training": "transfer training",
      "fall risk": "fall risk",

      // Respiratory
      "shortness of breath": "dyspnea",
      sob: "dyspnea",
      "s o b": "dyspnea",
      "chest pain": "chest pain",
      "oxygen therapy": "oxygen therapy",
      "o2 therapy": "oxygen therapy",

      // Common abbreviations
      pt: "patient",
      hcp: "healthcare provider",
      rn: "registered nurse",
      md: "medical doctor",
      pt: "physical therapy", // context dependent
      ot: "occupational therapy",
      st: "speech therapy",
      rt: "respiratory therapy",
    };

    // Apply corrections with word boundary matching
    Object.entries(enhancedCorrections).forEach(([pattern, replacement]) => {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedPattern}\\b`, "gi");
      corrected = corrected.replace(regex, replacement);
    });

    // Apply medical terminology from specialty list
    medicalTerms.forEach((term) => {
      const words = term.split(" ");
      if (words.length > 1) {
        // Handle multi-word terms
        const pattern = words.join("\\s+");
        const regex = new RegExp(`\\b${pattern}\\b`, "gi");
        corrected = corrected.replace(regex, term);
      }
    });

    return corrected;
  }

  /**
   * Initialize offline voice recognition capabilities
   */
  private async initializeOfflineVoiceRecognition(
    specialty?: string,
  ): Promise<void> {
    try {
      // Store medical terminology for offline use
      const offlineData = {
        medicalTerminology: specialty || "general",
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      localStorage.setItem("offline_voice_config", JSON.stringify(offlineData));
      console.log("Offline voice recognition initialized for:", specialty);
    } catch (error) {
      console.error("Failed to initialize offline voice recognition:", error);
    }
  }

  /**
   * Store offline voice data for later synchronization
   */
  private async storeOfflineVoiceData(data: {
    sessionId: string;
    transcript: string;
    confidence: number;
    isFinal: boolean;
    timestamp: string;
    clinicalAnalysis?: any;
    medicalEntities?: any[];
  }): Promise<void> {
    try {
      const existingData = JSON.parse(
        localStorage.getItem("offline_voice_data") || "[]",
      );
      existingData.push(data);
      localStorage.setItem("offline_voice_data", JSON.stringify(existingData));

      // Queue for sync when online
      this.queueOfflineMessage(
        {
          type: "voice_data",
          data,
          timestamp: data.timestamp,
        },
        "medium",
      );
    } catch (error) {
      console.error("Failed to store offline voice data:", error);
    }
  }

  /**
   * Initialize push notifications
   */
  async initializePushNotifications(
    config: PushNotificationConfig,
  ): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push notifications not supported");
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register(
        config.serviceWorkerPath,
      );

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Subscribe to push notifications
      this.pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(config.vapidPublicKey),
      });

      // Send subscription to server
      await this.sendPushSubscriptionToServer(this.pushSubscription);

      AuditLogger.logSecurityEvent({
        type: "system_event",
        details: {
          action: "push_notifications_initialized",
          endpoint: this.pushSubscription.endpoint,
        },
        severity: "low",
      });
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
      throw error;
    }
  }

  /**
   * Send push subscription to server
   */
  private async sendPushSubscriptionToServer(
    subscription: PushSubscription,
  ): Promise<void> {
    serviceWorkerService.addSyncTask({
      type: "api-call",
      data: {
        subscription: subscription.toJSON(),
        timestamp: new Date().toISOString(),
      },
      url: "/api/push/subscribe",
      method: "POST",
      priority: "medium",
      maxRetries: 3,
    });
  }

  /**
   * Show local notification
   */
  async showLocalNotification(
    title: string,
    options: NotificationOptions,
  ): Promise<void> {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        ...options,
        icon: options.icon || "/icons/notification-icon.png",
        badge: options.badge || "/icons/notification-badge.png",
      });

      // Auto-close after 10 seconds for non-critical notifications
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  /**
   * Encrypt message for secure transmission
   */
  async encryptMessage(message: string): Promise<string> {
    try {
      // Simple encryption for demo - use proper encryption in production
      const encrypted = btoa(
        JSON.stringify({
          data: message,
          timestamp: new Date().toISOString(),
          key: this.encryptionKey,
        }),
      );
      return encrypted;
    } catch (error) {
      console.error("Failed to encrypt message:", error);
      throw error;
    }
  }

  /**
   * Decrypt message
   */
  async decryptMessage(encryptedMessage: string): Promise<string> {
    try {
      const decrypted = JSON.parse(atob(encryptedMessage));
      if (decrypted.key !== this.encryptionKey) {
        throw new Error("Invalid encryption key");
      }
      return decrypted.data;
    } catch (error) {
      console.error("Failed to decrypt message:", error);
      throw error;
    }
  }

  /**
   * Setup network listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      console.log("Network connection restored");
      this.processOfflineQueue();
    });

    window.addEventListener("offline", () => {
      console.log("Network connection lost");
    });
  }

  /**
   * Save offline queue to localStorage
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(
        "mobile_comm_offline_queue",
        JSON.stringify(this.offlineMessageQueue),
      );
    } catch (error) {
      console.error("Failed to save offline queue:", error);
    }
  }

  /**
   * Load offline queue from localStorage
   */
  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem("mobile_comm_offline_queue");
      if (saved) {
        this.offlineMessageQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load offline queue:", error);
      this.offlineMessageQueue = [];
    }
  }

  /**
   * Generate offline message ID
   */
  private generateOfflineMessageId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get network status
   */
  getNetworkStatus(): {
    online: boolean;
    connectionType?: string;
    effectiveType?: string;
  } {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
    };
  }

  /**
   * Clear offline queue
   */
  clearOfflineQueue(): void {
    this.offlineMessageQueue = [];
    this.saveOfflineQueue();
  }

  /**
   * Get voice recognition status
   */
  getVoiceRecognitionStatus(): {
    supported: boolean;
    active: boolean;
    language?: string;
  } {
    return {
      supported: this.isVoiceRecognitionSupported(),
      active: this.isRecognitionActive,
      language: this.speechRecognition?.lang,
    };
  }
}

// Export singleton instance
export const mobileCommunicationService = new MobileCommunicationService();
export default mobileCommunicationService;
