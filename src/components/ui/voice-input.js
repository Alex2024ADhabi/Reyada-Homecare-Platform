import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { mobileCommunicationService } from "@/services/mobile-communication.service";
export function VoiceInput({ onTextCapture, placeholder = "Press the microphone button and start speaking...", className = "", medicalSpecialty = "general", continuousRecognition = false, offlineMode = false, }) {
    const { text, isListening, startListening, stopListening, hasRecognitionSupport, error, } = useSpeechRecognition();
    const [animationStep, setAnimationStep] = useState(0);
    const [enhancedMode, setEnhancedMode] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [confidence, setConfidence] = useState(0);
    // Handle animation for the microphone when listening
    useEffect(() => {
        let animationInterval;
        if (isListening) {
            animationInterval = setInterval(() => {
                setAnimationStep((prev) => (prev + 1) % 3);
            }, 500);
        }
        else {
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
                const result = await mobileCommunicationService.startEnhancedVoiceRecognition({
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
            }
            catch (error) {
                console.error("Enhanced voice recognition initialization failed:", error);
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
        const handleVoiceResult = (result) => {
            if (result.confidence) {
                setConfidence(Math.round(result.confidence * 100));
            }
        };
        mobileCommunicationService.onVoiceRecognitionResult(handleVoiceResult);
        return () => {
            mobileCommunicationService.removeVoiceRecognitionCallback(handleVoiceResult);
        };
    }, []);
    if (!hasRecognitionSupport) {
        return (_jsx("div", { className: `flex items-center justify-center p-4 ${className}`, children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Speech recognition is not supported in this browser." }) }));
    }
    return (_jsxs("div", { className: `flex flex-col items-center gap-4 ${className}`, children: [_jsxs("div", { className: "relative", children: [_jsx(Button, { type: "button", size: "lg", className: `rounded-full h-16 w-16 ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`, onClick: isListening ? stopListening : startListening, children: isListening ? _jsx(MicOff, { size: 24 }) : _jsx(Mic, { size: 24 }) }), isListening && (_jsxs(_Fragment, { children: [_jsx("div", { className: `absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 0 ? "75" : "0"}` }), _jsx("div", { className: `absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 1 ? "50" : "0"}` }), _jsx("div", { className: `absolute -inset-4 rounded-full border-2 border-red-500 animate-ping opacity-${animationStep === 2 ? "25" : "0"}` })] }))] }), _jsxs("div", { className: "text-center space-y-2", children: [isListening ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 text-red-500", children: [_jsx(Volume2, { className: "animate-pulse", size: 16 }), _jsx("span", { children: "Listening..." }), enhancedMode && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Enhanced" }))] }), confidence > 0 && (_jsx("div", { className: "flex items-center justify-center gap-2 text-sm text-gray-600", children: _jsxs("span", { children: ["Confidence: ", confidence, "%"] }) }))] })) : (_jsx("p", { className: "text-sm text-muted-foreground", children: placeholder })), medicalSpecialty !== "general" && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [medicalSpecialty.charAt(0).toUpperCase() +
                                medicalSpecialty.slice(1), " ", "Mode"] })), offlineMode && (_jsx(Badge, { variant: "outline", className: "text-xs text-orange-600", children: "Offline Mode" }))] }), error && _jsx("p", { className: "text-sm text-red-500", children: error }), enhancedMode && (_jsx("div", { className: "text-center", children: _jsxs("div", { className: "flex items-center justify-center gap-4 text-xs text-gray-500", children: [_jsx("span", { children: "\u2713 Medical Terminology" }), _jsx("span", { children: "\u2713 Real-time Processing" }), continuousRecognition && _jsx("span", { children: "\u2713 Continuous" }), offlineMode && _jsx("span", { children: "\u2713 Offline Support" })] }) }))] }));
}
