import { errorHandlerService } from "./error-handler.service";
import { offlineService } from "./offline.service";

interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface CameraCapture {
  id: string;
  timestamp: string;
  type: "wound" | "document" | "general";
  imageData: string;
  metadata: {
    patientId?: string;
    location?: string;
    notes?: string;
    medicalContext?: string;
  };
}

interface VoiceRecording {
  id: string;
  timestamp: string;
  audioData: Blob;
  transcription?: string;
  medicalTerms?: string[];
  patientId?: string;
  formField?: string;
}

interface PWACapabilities {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasNotifications: boolean;
  hasGeolocation: boolean;
  isOnline: boolean;
  batteryLevel?: number;
  networkType?: string;
}

class MobilePWAService {
  private installPrompt: PWAInstallPrompt | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private capabilities: PWACapabilities = {
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    hasCamera: false,
    hasMicrophone: false,
    hasNotifications: false,
    hasGeolocation: false,
    isOnline: navigator.onLine,
  };

  // Medical terminology dictionary for voice recognition
  private medicalTerms = [
    "hypertension",
    "diabetes",
    "medication",
    "blood pressure",
    "glucose",
    "insulin",
    "wound",
    "dressing",
    "vital signs",
    "temperature",
    "pulse",
    "respiration",
    "oxygen saturation",
    "pain scale",
    "assessment",
    "treatment",
    "diagnosis",
    "symptoms",
    "allergies",
    "contraindications",
    "dosage",
    "frequency",
    "administration",
    "monitoring",
    "compliance",
    "adverse reaction",
    "side effects",
  ];

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
    this.detectCapabilities();
  }

  private async initializePWA(): Promise<void> {
    try {
      // Register service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[PWA] Service Worker registered:", registration.scope);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                this.emit("sw-update-available", { registration });
              }
            });
          }
        });
      }

      // Setup install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.installPrompt = e as any;
        this.capabilities.canInstall = true;
        this.emit("install-available", { canInstall: true });
      });

      // Detect if app is installed
      window.addEventListener("appinstalled", () => {
        this.capabilities.isInstalled = true;
        this.installPrompt = null;
        this.capabilities.canInstall = false;
        this.emit("app-installed", { installed: true });
      });

      // Check if running in standalone mode
      this.capabilities.isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.initializePWA",
      });
    }
  }

  private setupEventListeners(): void {
    // Network status monitoring
    window.addEventListener("online", () => {
      this.capabilities.isOnline = true;
      this.emit("network-status-changed", { isOnline: true });
    });

    window.addEventListener("offline", () => {
      this.capabilities.isOnline = false;
      this.emit("network-status-changed", { isOnline: false });
    });

    // Battery status monitoring
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.capabilities.batteryLevel = battery.level * 100;

        battery.addEventListener("levelchange", () => {
          this.capabilities.batteryLevel = battery.level * 100;
          this.emit("battery-changed", {
            level: this.capabilities.batteryLevel,
          });

          // Alert for low battery during critical operations
          if (battery.level < 0.15) {
            this.emit("low-battery-warning", { level: battery.level * 100 });
          }
        });
      });
    }

    // Network connection monitoring
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      this.capabilities.networkType = connection.effectiveType;

      connection.addEventListener("change", () => {
        this.capabilities.networkType = connection.effectiveType;
        this.emit("connection-changed", {
          type: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      });
    }
  }

  private async detectCapabilities(): Promise<void> {
    try {
      // Check camera access
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          this.capabilities.hasCamera = devices.some(
            (device) => device.kind === "videoinput",
          );
          this.capabilities.hasMicrophone = devices.some(
            (device) => device.kind === "audioinput",
          );
        } catch (error) {
          console.log("[PWA] Media devices enumeration failed:", error);
        }
      }

      // Check notification permission
      if ("Notification" in window) {
        this.capabilities.hasNotifications =
          Notification.permission === "granted";
      }

      // Check geolocation
      if ("geolocation" in navigator) {
        this.capabilities.hasGeolocation = true;
      }

      this.emit("capabilities-detected", this.capabilities);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.detectCapabilities",
      });
    }
  }

  // PWA Installation
  async promptInstall(): Promise<boolean> {
    try {
      if (!this.installPrompt) {
        throw new Error("Install prompt not available");
      }

      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
        return true;
      } else {
        console.log("[PWA] User dismissed the install prompt");
        return false;
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.promptInstall",
      });
      return false;
    }
  }

  // Camera Integration for Wound Documentation
  async captureImage(
    type: "wound" | "document" | "general" = "general",
    options?: {
      patientId?: string;
      location?: string;
      notes?: string;
    },
  ): Promise<CameraCapture> {
    try {
      if (!this.capabilities.hasCamera) {
        throw new Error("Camera not available");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: type === "wound" ? "environment" : "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        video.srcObject = stream;
        video.play();

        video.addEventListener("loadedmetadata", () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Capture frame
          context?.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg", 0.8);

          // Stop camera stream
          stream.getTracks().forEach((track) => track.stop());

          const capture: CameraCapture = {
            id: `capture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            type,
            imageData,
            metadata: {
              patientId: options?.patientId,
              location: options?.location,
              notes: options?.notes,
              medicalContext:
                type === "wound"
                  ? "Wound documentation for clinical assessment"
                  : undefined,
            },
          };

          // Store capture for offline access
          this.storeCaptureOffline(capture);

          resolve(capture);
        });

        video.addEventListener("error", (error) => {
          stream.getTracks().forEach((track) => track.stop());
          reject(error);
        });
      });
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.captureImage",
        type,
        options,
      });
      throw error;
    }
  }

  // Voice-to-Text with Medical Terminology
  async startVoiceRecording(options?: {
    patientId?: string;
    formField?: string;
    medicalContext?: boolean;
  }): Promise<VoiceRecording> {
    try {
      if (!this.capabilities.hasMicrophone) {
        throw new Error("Microphone not available");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;

      // Setup audio context for processing
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Setup media recorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      return new Promise((resolve, reject) => {
        this.mediaRecorder!.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

            // Attempt speech recognition
            let transcription = "";
            let medicalTerms: string[] = [];

            if (
              "webkitSpeechRecognition" in window ||
              "SpeechRecognition" in window
            ) {
              const result = await this.performSpeechRecognition(
                options?.medicalContext,
              );
              transcription = result.transcript;
              medicalTerms = result.medicalTerms;
            }

            const recording: VoiceRecording = {
              id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              audioData: audioBlob,
              transcription,
              medicalTerms,
              patientId: options?.patientId,
              formField: options?.formField,
            };

            // Store recording for offline access
            this.storeRecordingOffline(recording);

            resolve(recording);
          } catch (error) {
            reject(error);
          } finally {
            this.cleanup();
          }
        };

        this.mediaRecorder!.onerror = (error) => {
          this.cleanup();
          reject(error);
        };

        this.mediaRecorder!.start();
      });
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.startVoiceRecording",
        options,
      });
      throw error;
    }
  }

  stopVoiceRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  private async performSpeechRecognition(medicalContext = false): Promise<{
    transcript: string;
    medicalTerms: string[];
  }> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        resolve({ transcript: "", medicalTerms: [] });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Enhanced for medical terminology
      if (medicalContext) {
        recognition.maxAlternatives = 3;
      }

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onend = () => {
        const detectedMedicalTerms = this.extractMedicalTerms(finalTranscript);
        resolve({
          transcript: finalTranscript.trim(),
          medicalTerms: detectedMedicalTerms,
        });
      };

      recognition.onerror = (error: any) => {
        console.log("[PWA] Speech recognition error:", error);
        resolve({ transcript: "", medicalTerms: [] });
      };

      recognition.start();

      // Auto-stop after 30 seconds
      setTimeout(() => {
        recognition.stop();
      }, 30000);
    });
  }

  private extractMedicalTerms(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return this.medicalTerms.filter((term) =>
      words.some((word) => word.includes(term) || term.includes(word)),
    );
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
  }

  // Offline Storage
  private async storeCaptureOffline(capture: CameraCapture): Promise<void> {
    try {
      const key = `capture-${capture.id}`;
      await offlineService.storeData(key, capture);
    } catch (error) {
      console.error("[PWA] Failed to store capture offline:", error);
    }
  }

  private async storeRecordingOffline(
    recording: VoiceRecording,
  ): Promise<void> {
    try {
      // Convert blob to base64 for storage
      const audioBase64 = await this.blobToBase64(recording.audioData);
      const storableRecording = {
        ...recording,
        audioData: audioBase64,
      };

      const key = `recording-${recording.id}`;
      await offlineService.storeData(key, storableRecording);
    } catch (error) {
      console.error("[PWA] Failed to store recording offline:", error);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Push Notifications for Healthcare Alerts
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!("Notification" in window)) {
        return false;
      }

      if (Notification.permission === "granted") {
        this.capabilities.hasNotifications = true;
        return true;
      }

      const permission = await Notification.requestPermission();
      this.capabilities.hasNotifications = permission === "granted";

      return permission === "granted";
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.requestNotificationPermission",
      });
      return false;
    }
  }

  async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      priority?: "low" | "normal" | "high" | "critical";
      actions?: Array<{ action: string; title: string; icon?: string }>;
      data?: any;
    },
  ): Promise<void> {
    try {
      if (!this.capabilities.hasNotifications) {
        console.log("[PWA] Notifications not available");
        return;
      }

      const notificationOptions: NotificationOptions = {
        body: options?.body,
        icon: options?.icon || "/icons/icon-192x192.png",
        badge: options?.badge || "/icons/icon-96x96.png",
        tag: options?.tag,
        data: options?.data,
        requireInteraction: options?.priority === "critical",
        actions: options?.actions,
      };

      // Use service worker for persistent notifications
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
      } else {
        new Notification(title, notificationOptions);
      }
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "MobilePWAService.showNotification",
        title,
        options,
      });
    }
  }

  // Geolocation for Healthcare Worker Tracking
  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.capabilities.hasGeolocation) {
        reject(new Error("Geolocation not available"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          errorHandlerService.handleError(error, {
            context: "MobilePWAService.getCurrentLocation",
          });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  // Getters
  getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  isInstalled(): boolean {
    return this.capabilities.isInstalled;
  }

  isStandalone(): boolean {
    return this.capabilities.isStandalone;
  }

  canInstall(): boolean {
    return this.capabilities.canInstall;
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in PWA event listener for ${event}:`, error);
        }
      });
    }
  }

  // Cleanup
  destroy(): void {
    this.cleanup();
    this.eventListeners.clear();
  }
}

export const mobilePWAService = new MobilePWAService();
export { CameraCapture, VoiceRecording, PWACapabilities };
export default mobilePWAService;
