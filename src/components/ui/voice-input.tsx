import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Settings } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { mobileCommunicationService } from "@/services/mobile-communication.service";

interface VoiceInputProps {
  onTextCapture: (text: string) => void;
  placeholder?: string;
  className?: string;
  medicalSpecialty?:
    | "nursing"
    | "physiotherapy"
    | "occupational"
    | "speech"
    | "respiratory"
    | "general";
  continuousRecognition?: boolean;
  offlineMode?: boolean;
}

export function VoiceInput({
  onTextCapture,
  placeholder = "Press the microphone button and start speaking...",
  className = "",
  medicalSpecialty = "general",
  continuousRecognition = false,
  offlineMode = false,
}: VoiceInputProps) {
  const {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
  } = useSpeechRecognition();
  const [animationStep, setAnimationStep] = useState(0);
  const [enhancedMode, setEnhancedMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  // Handle animation for the microphone when listening
  useEffect(() => {
    let animationInterval: NodeJS.Timeout;

    if (isListening) {
      animationInterval = setInterval(() => {
        setAnimationStep((prev) => (prev + 1) % 3);
      }, 500);
    } else {
      setAnimationStep(0);
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isListening]);

  // Initialize enhanced voice recognition
  useEffect(() => {
    const initializeEnhancedVoice = async () => {
      try {
        const result =
          await mobileCommunicationService.startEnhancedVoiceRecognition({
            language: "en-US",
            medicalTerminology: true,
            continuousRecognition,
            interimResults: true,
            medicalSpecialty,
            offlineMode,
            realTimeTranscription: true,
            speakerIdentification: false,
          });

        if (result.success) {
          setEnhancedMode(true);
          setSessionId(result.sessionId || null);
        }
      } catch (error) {
        console.error(
          "Enhanced voice recognition initialization failed:",
          error,
        );
      }
    };

    if (hasRecognitionSupport) {
      initializeEnhancedVoice();
    }
  }, [
    hasRecognitionSupport,
    medicalSpecialty,
    continuousRecognition,
    offlineMode,
  ]);

  // Update parent component with captured text
  useEffect(() => {
    if (text) {
      onTextCapture(text);
    }
  }, [text, onTextCapture]);

  // Listen for enhanced voice recognition results
  useEffect(() => {
    const handleVoiceResult = (result: any) => {
      if (result.confidence) {
        setConfidence(Math.round(result.confidence * 100));
      }
    };

    mobileCommunicationService.onVoiceRecognitionResult(handleVoiceResult);

    return () => {
      mobileCommunicationService.removeVoiceRecognitionCallback(
        handleVoiceResult,
      );
    };
  }, []);

  if (!hasRecognitionSupport) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">
          Speech recognition is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Button
          type="button"
          size="lg"
          className={`rounded-full h-16 w-16 ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </Button>

        {/* Animation rings when listening */}
        {isListening && (
          <>
            <div
              className={`absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 0 ? "75" : "0"}`}
            ></div>
            <div
              className={`absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 1 ? "50" : "0"}`}
            ></div>
            <div
              className={`absolute -inset-4 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 2 ? "25" : "0"}`}
            ></div>
          </>
        )}
      </div>

      <div className="text-center space-y-2">
        {isListening ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Volume2 className="animate-pulse" size={16} />
              <span>Listening...</span>
              {enhancedMode && (
                <Badge variant="outline" className="text-xs">
                  Enhanced
                </Badge>
              )}
            </div>
            {confidence > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>Confidence: {confidence}%</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}

        {/* Medical Specialty Indicator */}
        {medicalSpecialty !== "general" && (
          <Badge variant="secondary" className="text-xs">
            {medicalSpecialty.charAt(0).toUpperCase() +
              medicalSpecialty.slice(1)}{" "}
            Mode
          </Badge>
        )}

        {/* Offline Mode Indicator */}
        {offlineMode && (
          <Badge variant="outline" className="text-xs text-orange-600">
            Offline Mode
          </Badge>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Enhanced Features Status */}
      {enhancedMode && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>✓ Medical Terminology</span>
            <span>✓ Real-time Processing</span>
            {continuousRecognition && <span>✓ Continuous</span>}
            {offlineMode && <span>✓ Offline Support</span>}
          </div>
        </div>
      )}
    </div>
  );
}
