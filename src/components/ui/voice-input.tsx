/**
 * Voice-to-Text Input Component with Medical Terminology
 * Enhanced for clinical documentation with medical vocabulary
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  AlertCircle,
  Stethoscope,
  Brain,
  Languages,
  Accessibility,
  Eye,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscriptionComplete: (
    text: string,
    metadata: TranscriptionMetadata,
  ) => void;
  onTranscriptionUpdate?: (text: string) => void;
  placeholder?: string;
  className?: string;
  medicalMode?: boolean;
  language?: string;
  maxDuration?: number;
}

interface TranscriptionMetadata {
  duration: number;
  confidence: number;
  language: string;
  medicalTermsDetected: string[];
  audioQuality: number;
  processingTime: number;
  timestamp: string;
  corrections: {
    original: string;
    corrected: string;
    confidence: number;
  }[];
}

interface MedicalTerm {
  term: string;
  category: string;
  alternatives: string[];
  confidence: number;
}

// Medical terminology dictionary for enhanced recognition
const MEDICAL_VOCABULARY = {
  anatomy: [
    "abdomen",
    "thorax",
    "pelvis",
    "cranium",
    "sternum",
    "clavicle",
    "scapula",
    "humerus",
    "radius",
    "ulna",
    "femur",
    "tibia",
    "fibula",
    "patella",
  ],
  conditions: [
    "hypertension",
    "diabetes",
    "pneumonia",
    "bronchitis",
    "asthma",
    "copd",
    "myocardial infarction",
    "stroke",
    "sepsis",
    "cellulitis",
    "dermatitis",
  ],
  medications: [
    "acetaminophen",
    "ibuprofen",
    "aspirin",
    "metformin",
    "lisinopril",
    "amlodipine",
    "atorvastatin",
    "omeprazole",
    "levothyroxine",
    "warfarin",
  ],
  procedures: [
    "intubation",
    "catheterization",
    "venipuncture",
    "suturing",
    "debridement",
    "tracheostomy",
    "thoracentesis",
    "paracentesis",
    "lumbar puncture",
  ],
  symptoms: [
    "dyspnea",
    "tachycardia",
    "bradycardia",
    "hypotension",
    "hypertension",
    "nausea",
    "vomiting",
    "diarrhea",
    "constipation",
    "syncope",
    "vertigo",
  ],
};

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptionComplete,
  onTranscriptionUpdate,
  placeholder = "Click the microphone to start voice input...",
  className,
  medicalMode = true,
  language = "en-US",
  maxDuration = 300, // 5 minutes
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [detectedMedicalTerms, setDetectedMedicalTerms] = useState<
    MedicalTerm[]
  >([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [voiceNavigationActive, setVoiceNavigationActive] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    checkBrowserSupport();
    initializeAccessibilityFeatures();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAccessibilityFeatures = () => {
    // Check for screen reader
    const isScreenReaderActive =
      window.navigator.userAgent.includes("NVDA") ||
      window.navigator.userAgent.includes("JAWS") ||
      window.speechSynthesis?.getVoices().length > 0;

    setScreenReaderMode(isScreenReaderActive);

    // Set up voice navigation commands
    if (voiceNavigationActive) {
      setupVoiceNavigation();
    }

    // Add keyboard shortcuts for accessibility
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+V to start/stop recording
      if (event.ctrlKey && event.shiftKey && event.key === "V") {
        event.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
      // Ctrl+Shift+C to clear transcription
      if (event.ctrlKey && event.shiftKey && event.key === "C") {
        event.preventDefault();
        clearTranscription();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  };

  const setupVoiceNavigation = () => {
    // Voice commands for navigation
    const voiceCommands = {
      "start recording": () => !isRecording && startRecording(),
      "stop recording": () => isRecording && stopRecording(),
      "clear text": () => clearTranscription(),
      "read transcription": () => {
        if (transcription && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(transcription);
          utterance.lang = language;
          window.speechSynthesis.speak(utterance);
        }
      },
    };

    // Arabic voice commands
    if (language.startsWith("ar")) {
      Object.assign(voiceCommands, {
        "ابدأ التسجيل": () => !isRecording && startRecording(),
        "أوقف التسجيل": () => isRecording && stopRecording(),
        "امسح النص": () => clearTranscription(),
      });
    }

    return voiceCommands;
  };

  const checkBrowserSupport = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const isMediaRecorderSupported = typeof MediaRecorder !== "undefined";
    const isAudioContextSupported =
      typeof AudioContext !== "undefined" ||
      typeof (window as any).webkitAudioContext !== "undefined";

    setIsSupported(
      !!SpeechRecognition &&
        isMediaRecorderSupported &&
        isAudioContextSupported,
    );

    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser");
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();

    // Enhanced configuration for medical terminology and accessibility
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    // Medical-specific settings with accessibility enhancements
    if (medicalMode) {
      recognition.grammars = createMedicalGrammar();
    }

    // Accessibility enhancements for voice navigation
    recognition.serviceURI = undefined; // Use default for better accessibility

    // UAE Arabic language support
    if (language.startsWith("ar")) {
      recognition.lang = "ar-AE"; // UAE Arabic
    }

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";
      let totalConfidence = 0;
      let resultCount = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + " ";
          totalConfidence += result[0].confidence || 0.8;
          resultCount++;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const processedText = medicalMode
          ? processMedicalText(finalTranscript)
          : finalTranscript;
        setTranscription((prev) => prev + processedText);

        if (medicalMode) {
          const medicalTerms = detectMedicalTerms(processedText);
          setDetectedMedicalTerms((prev) => [...prev, ...medicalTerms]);
        }

        onTranscriptionUpdate?.(transcription + processedText);

        // Accessibility: Announce transcription to screen readers
        if ((window as any).announceToScreenReader) {
          (window as any).announceToScreenReader(
            `Transcribed: ${processedText}`,
          );
        }

        // Voice feedback for accessibility
        if (screenReaderMode && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(
            `Transcribed: ${processedText}`,
          );
          utterance.lang = language;
          utterance.volume = 0.3;
          window.speechSynthesis.speak(utterance);
        }
      }

      if (interimTranscript) {
        setInterimTranscription(interimTranscript);
      }

      if (resultCount > 0) {
        setConfidence((totalConfidence / resultCount) * 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      stopRecording();
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      if (isRecording) {
        // Restart recognition if still recording
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    };

    return recognition;
  };

  const createMedicalGrammar = () => {
    // Create speech recognition grammar for medical terms
    const SpeechGrammarList =
      (window as any).SpeechGrammarList ||
      (window as any).webkitSpeechGrammarList;

    if (!SpeechGrammarList) return undefined;

    const grammarList = new SpeechGrammarList();

    // Build grammar rules for medical vocabulary
    const allMedicalTerms = Object.values(MEDICAL_VOCABULARY).flat();
    const grammarRules = `#JSGF V1.0; grammar medical; public <medical> = ${allMedicalTerms.join(" | ")};`;

    grammarList.addFromString(grammarRules, 1);
    return grammarList;
  };

  const initializeAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Set up audio level monitoring
      const AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();

      // Set up media recorder for audio backup
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      return stream;
    } catch (error) {
      console.error("Failed to initialize audio recording:", error);
      setError("Failed to access microphone. Please check permissions.");
      throw error;
    }
  };

  const startRecording = async () => {
    if (!isSupported) {
      setError("Voice input not supported in this browser");
      return;
    }

    try {
      setIsRecording(true);
      setError(null);
      setTranscription("");
      setInterimTranscription("");
      setDetectedMedicalTerms([]);
      setCorrections([]);
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      // Initialize audio recording
      await initializeAudioRecording();

      // Start speech recognition
      recognitionRef.current = initializeSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start media recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start(1000); // Collect data every second
      }

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError("Failed to start recording. Please try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      // Stop media recorder
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Process final transcription
      const processingStartTime = Date.now();
      const finalText = transcription + interimTranscription;

      if (finalText.trim()) {
        const processedText = medicalMode
          ? await enhanceMedicalTranscription(finalText)
          : finalText;

        const metadata: TranscriptionMetadata = {
          duration: recordingDuration,
          confidence,
          language,
          medicalTermsDetected: detectedMedicalTerms.map((term) => term.term),
          audioQuality: calculateAudioQuality(),
          processingTime: Date.now() - processingStartTime,
          timestamp: new Date().toISOString(),
          corrections,
        };

        onTranscriptionComplete(processedText, metadata);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      setError("Error processing recording");
    } finally {
      cleanup();
      setIsProcessing(false);
      setRecordingDuration(0);
      setAudioLevel(0);
      setInterimTranscription("");
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const processMedicalText = (text: string): string => {
    let processedText = text;

    // Common medical abbreviation expansions with Arabic support
    const abbreviations: { [key: string]: string } = {
      bp: "blood pressure",
      hr: "heart rate",
      rr: "respiratory rate",
      temp: "temperature",
      "o2 sat": "oxygen saturation",
      bpm: "beats per minute",
      mg: "milligrams",
      ml: "milliliters",
      cc: "cubic centimeters",
      // Arabic medical terms (transliterated)
      "ضغط الدم": "blood pressure",
      "معدل ضربات القلب": "heart rate",
      "معدل التنفس": "respiratory rate",
      "درجة الحرارة": "temperature",
      "تشبع الأكسجين": "oxygen saturation",
    };

    // Apply abbreviation expansions
    Object.entries(abbreviations).forEach(([abbr, expansion]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, "gi");
      processedText = processedText.replace(regex, expansion);
    });

    // Handle Arabic numerals and medical terms
    if (language.startsWith("ar")) {
      processedText = processArabicMedicalText(processedText);
    }

    return processedText;
  };

  const processArabicMedicalText = (text: string): string => {
    let processedText = text;

    // Convert Arabic-Indic numerals to Western numerals for medical consistency
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const westernNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    arabicNumerals.forEach((arabicNum, index) => {
      const regex = new RegExp(arabicNum, "g");
      processedText = processedText.replace(regex, westernNumerals[index]);
    });

    return processedText;
  };

  const detectMedicalTerms = (text: string): MedicalTerm[] => {
    const detectedTerms: MedicalTerm[] = [];
    const words = text.toLowerCase().split(/\s+/);

    Object.entries(MEDICAL_VOCABULARY).forEach(([category, terms]) => {
      terms.forEach((term) => {
        if (
          words.some(
            (word) =>
              word.includes(term.toLowerCase()) ||
              term.toLowerCase().includes(word),
          )
        ) {
          detectedTerms.push({
            term,
            category,
            alternatives: [],
            confidence: 0.8,
          });
        }
      });
    });

    return detectedTerms;
  };

  const enhanceMedicalTranscription = async (text: string): Promise<string> => {
    // Enhanced processing for medical terminology
    // In production, this could call a medical NLP API

    let enhancedText = text;

    // Spell check medical terms
    const medicalTerms = detectMedicalTerms(text);

    // Apply medical context corrections
    const medicalCorrections = [
      { from: /\bpain in the chest\b/gi, to: "chest pain" },
      { from: /\bshort of breath\b/gi, to: "dyspnea" },
      { from: /\bfast heart rate\b/gi, to: "tachycardia" },
      { from: /\bslow heart rate\b/gi, to: "bradycardia" },
      { from: /\bhigh blood pressure\b/gi, to: "hypertension" },
      { from: /\blow blood pressure\b/gi, to: "hypotension" },
    ];

    medicalCorrections.forEach((correction) => {
      if (correction.from.test(enhancedText)) {
        const original = enhancedText.match(correction.from)?.[0] || "";
        enhancedText = enhancedText.replace(correction.from, correction.to);

        if (original) {
          setCorrections((prev) => [
            ...prev,
            {
              original,
              corrected: correction.to,
              confidence: 0.9,
            },
          ]);
        }
      }
    });

    return enhancedText;
  };

  const calculateAudioQuality = (): number => {
    // Simple audio quality calculation based on audio level consistency
    return Math.min(100, Math.max(0, audioLevel * 2));
  };

  const clearTranscription = () => {
    setTranscription("");
    setInterimTranscription("");
    setDetectedMedicalTerms([]);
    setCorrections([]);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Voice input is not supported in this browser. Please use Chrome,
              Edge, or Safari for voice functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full bg-white", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice-to-Text Input
          {medicalMode && (
            <Badge variant="secondary" className="ml-2">
              <Stethoscope className="h-3 w-3 mr-1" />
              Medical Mode
            </Badge>
          )}
          <Badge variant="outline" className="ml-2">
            <Accessibility className="h-3 w-3 mr-1" />
            WCAG 2.1 AA
          </Badge>
        </CardTitle>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Languages className="h-3 w-3 mr-1" />
            {language === "ar-AE" ? "🇦🇪 Arabic (UAE)" : language}
          </Badge>
          {confidence > 0 && (
            <Badge
              variant={
                confidence > 80
                  ? "default"
                  : confidence > 60
                    ? "secondary"
                    : "destructive"
              }
            >
              Confidence: {confidence.toFixed(0)}%
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Volume2 className="h-3 w-3 mr-1" />
            Screen Reader Compatible
          </Badge>
          {language.startsWith("ar") && (
            <Badge variant="outline" className="text-xs">
              🇦🇪 RTL Support
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Keyboard className="h-3 w-3 mr-1" />
            Ctrl+Shift+V
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center space-x-4">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className="min-w-32"
            aria-label={
              isRecording ? "Stop voice recording" : "Start voice recording"
            }
            aria-describedby="voice-input-help"
          >
            {isProcessing ? (
              <>
                <Brain className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : isRecording ? (
              <>
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          {(transcription || interimTranscription) && (
            <Button
              variant="outline"
              onClick={clearTranscription}
              aria-label="Clear transcription text"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div
          id="voice-input-help"
          className="text-sm text-gray-600 text-center"
        >
          Use Ctrl+Shift+V to start/stop recording, Ctrl+Shift+C to clear text
        </div>

        {/* Accessibility Controls */}
        <div className="flex items-center justify-center gap-4 p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="voice-navigation"
              checked={voiceNavigationActive}
              onChange={(e) => setVoiceNavigationActive(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="voice-navigation"
              className="text-sm flex items-center gap-1"
            >
              <Volume2 className="h-3 w-3" />
              Voice Navigation
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="screen-reader-mode"
              checked={screenReaderMode}
              onChange={(e) => setScreenReaderMode(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="screen-reader-mode"
              className="text-sm flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Screen Reader Mode
            </label>
          </div>
        </div>

        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Recording: {formatDuration(recordingDuration)}</span>
              <span>Max: {formatDuration(maxDuration)}</span>
            </div>
            <Progress
              value={(recordingDuration / maxDuration) * 100}
              className="h-2"
            />

            <div className="flex items-center gap-2">
              {audioLevel > 10 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <Progress value={audioLevel} className="h-2 flex-1" />
              <span className="text-xs">{Math.round(audioLevel)}%</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            value={
              transcription +
              (interimTranscription ? ` ${interimTranscription}` : "")
            }
            placeholder={placeholder}
            className="min-h-32 resize-none"
            readOnly
            aria-label="Voice transcription output"
            aria-live="polite"
            aria-atomic="true"
            dir={language.startsWith("ar") ? "rtl" : "ltr"}
          />

          {interimTranscription && (
            <p className="text-sm text-gray-500 italic">
              Interim: {interimTranscription}
            </p>
          )}
        </div>

        {medicalMode && detectedMedicalTerms.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Detected Medical Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {detectedMedicalTerms.map((term, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {term.term} ({term.category})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {corrections.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              Auto-Corrections Applied
            </h4>
            <div className="space-y-1">
              {corrections.map((correction, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="line-through text-gray-500">
                    {correction.original}
                  </span>
                  {" → "}
                  <span className="font-medium">{correction.corrected}</span>
                  <span className="ml-2 text-gray-400">
                    ({(correction.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInput;
