import { useState, useEffect, useCallback } from "react";
// Medical terminology dictionary for better recognition
const medicalTerminology = [
    "hypertension",
    "diabetes mellitus",
    "myocardial infarction",
    "cerebrovascular accident",
    "chronic obstructive pulmonary disease",
    "congestive heart failure",
    "gastroesophageal reflux disease",
    "rheumatoid arthritis",
    "osteoarthritis",
    "hyperlipidemia",
    "hypothyroidism",
    "hyperthyroidism",
    "pneumonia",
    "urinary tract infection",
    "cellulitis",
    "sepsis",
    "anemia",
    "deep vein thrombosis",
    "pulmonary embolism",
    "renal failure",
    "hepatitis",
    "cirrhosis",
    "pancreatitis",
    "appendicitis",
    "diverticulitis",
    "cholecystitis",
    "pyelonephritis",
    "meningitis",
    "encephalitis",
    "multiple sclerosis",
    "parkinson disease",
    "alzheimer disease",
    "epilepsy",
    "asthma",
    "bronchitis",
    "emphysema",
    "hypertensive heart disease",
    "atrial fibrillation",
    "ventricular tachycardia",
    "bradycardia",
    "tachycardia",
    "hypotension",
    "hyperglycemia",
    "hypoglycemia",
    "hyperkalemia",
    "hypokalemia",
    "hypernatremia",
    "hyponatremia",
    "hypercalcemia",
    "hypocalcemia",
    "metabolic acidosis",
    "metabolic alkalosis",
    "respiratory acidosis",
    "respiratory alkalosis",
    "stage one pressure ulcer",
    "stage two pressure ulcer",
    "stage three pressure ulcer",
    "stage four pressure ulcer",
    "unstageable pressure ulcer",
    "deep tissue injury",
    "venous stasis ulcer",
    "arterial ulcer",
    "diabetic ulcer",
    "neuropathic ulcer",
    "wound dehiscence",
    "surgical site infection",
    "purulent drainage",
    "serous drainage",
    "serosanguineous drainage",
    "sanguineous drainage",
    "granulation tissue",
    "necrotic tissue",
    "slough",
    "eschar",
    "undermining",
    "tunneling",
    "maceration",
    "induration",
    "erythema",
    "edema",
    "ecchymosis",
    "petechiae",
    "cyanosis",
    "pallor",
    "jaundice",
    "diaphoresis",
    "dyspnea",
    "orthopnea",
    "tachypnea",
    "bradypnea",
    "apnea",
    "hemoptysis",
    "hematemesis",
    "hematochezia",
    "melena",
    "hematuria",
    "dysuria",
    "oliguria",
    "anuria",
    "polyuria",
    "nocturia",
    "frequency",
    "urgency",
    "incontinence",
    "retention",
    "constipation",
    "diarrhea",
    "dysphagia",
    "odynophagia",
    "anorexia",
    "nausea",
    "vomiting",
    "hemodynamically stable",
    "hemodynamically unstable",
    "afebrile",
    "febrile",
    "normotensive",
    "hypertensive",
    "hypotensive",
    "tachycardic",
    "bradycardic",
    "eupneic",
    "dyspneic",
    "tachypneic",
    "bradypneic",
    "apneic",
    "normoglycemic",
    "hyperglycemic",
    "hypoglycemic",
];
/**
 * Hook for using speech recognition with medical terminology support
 */
export function useSpeechRecognition(options = {}) {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);
    // Check if browser supports speech recognition
    const hasRecognitionSupport = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    // Initialize speech recognition
    useEffect(() => {
        if (!hasRecognitionSupport) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }
        try {
            // Get the appropriate SpeechRecognition constructor
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            // Configure recognition
            recognitionInstance.continuous = options.continuous ?? true;
            recognitionInstance.interimResults = options.interimResults ?? true;
            recognitionInstance.lang = options.language ?? "en-US";
            recognitionInstance.maxAlternatives = options.maxAlternatives ?? 1;
            // Set up event handlers
            recognitionInstance.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        let finalTranscript = result[0].transcript;
                        // Apply medical terminology corrections
                        finalTranscript = correctMedicalTerminology(finalTranscript);
                        transcript += finalTranscript + " ";
                    }
                }
                if (transcript) {
                    setText((prev) => prev + transcript);
                }
            };
            recognitionInstance.onerror = (event) => {
                if (event.error !== "no-speech") {
                    setError(`Speech recognition error: ${event.error}`);
                }
            };
            recognitionInstance.onend = () => {
                setIsListening(false);
            };
            setRecognition(recognitionInstance);
        }
        catch (err) {
            setError("Failed to initialize speech recognition.");
            console.error("Speech recognition initialization error:", err);
        }
    }, [
        hasRecognitionSupport,
        options.continuous,
        options.interimResults,
        options.language,
        options.maxAlternatives,
    ]);
    // Correct medical terminology in the transcript
    const correctMedicalTerminology = (transcript) => {
        let correctedTranscript = transcript.toLowerCase();
        // Check for medical terms and correct them
        medicalTerminology.forEach((term) => {
            // Create a regex that matches the term with some flexibility
            const termParts = term.split(" ");
            const termRegexParts = termParts.map((part) => `(?:\\s|^)${part}(?:\\s|$|\\.|,|;)`);
            const termRegexStr = termRegexParts.join(".*?");
            const termRegex = new RegExp(termRegexStr, "i");
            // Check for close matches
            if (termRegex.test(correctedTranscript)) {
                // Replace the matched text with the correct term
                const match = correctedTranscript.match(termRegex)?.[0] || "";
                if (match) {
                    correctedTranscript = correctedTranscript.replace(match, ` ${term} `);
                }
            }
        });
        return correctedTranscript;
    };
    // Start listening with quality controls
    const startListening = useCallback(() => {
        if (!recognition) {
            setError("Speech recognition not available");
            return;
        }
        // Quality control: Check if already listening
        if (isListening) {
            console.warn("Speech recognition is already active");
            return;
        }
        // Quality control: Validate browser support
        if (!hasRecognitionSupport) {
            setError("Speech recognition is not supported in this browser");
            return;
        }
        setText("");
        setError(null);
        setIsListening(true);
        try {
            recognition.start();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to start speech recognition: ${errorMessage}`);
            setIsListening(false);
            console.error("Speech recognition start error:", err);
        }
    }, [recognition, isListening, hasRecognitionSupport]);
    // Stop listening with quality controls
    const stopListening = useCallback(() => {
        if (!recognition) {
            setError("Speech recognition not available");
            return;
        }
        // Quality control: Check if currently listening
        if (!isListening) {
            console.warn("Speech recognition is not currently active");
            return;
        }
        try {
            recognition.stop();
            setIsListening(false);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Failed to stop speech recognition: ${errorMessage}`);
            console.error("Speech recognition stop error:", err);
        }
    }, [recognition, isListening]);
    return {
        text,
        isListening,
        startListening,
        stopListening,
        hasRecognitionSupport,
        error,
    };
}
