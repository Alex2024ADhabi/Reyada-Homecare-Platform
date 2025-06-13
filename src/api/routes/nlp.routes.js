import express from "express";
import { naturalLanguageProcessingService } from "@/services/natural-language-processing.service";
const router = express.Router();
// Process clinical notes with NLP analysis
router.post("/clinical-analysis", async (req, res) => {
    try {
        const { text, language, includeCodeSuggestions, includeSentimentAnalysis, patientContext, } = req.body;
        if (!text) {
            return res.status(400).json({
                error: "Text is required for clinical analysis",
                code: "MISSING_TEXT",
            });
        }
        const result = await naturalLanguageProcessingService.processClinicalNote(text, {
            language,
            includeCodeSuggestions,
            includeSentimentAnalysis,
            patientContext,
        });
        res.json({
            success: true,
            result,
            processingInfo: {
                textLength: text.length,
                entitiesFound: result.entities.length,
                conceptsIdentified: result.concepts.length,
                codingSuggestions: result.codingSuggestions.length,
                processingTime: result.processingTime,
            },
        });
    }
    catch (error) {
        console.error("Clinical NLP analysis failed:", error);
        res.status(500).json({
            error: "Failed to process clinical text",
            message: error.message,
        });
    }
});
// Generate automated coding suggestions
router.post("/coding-suggestions", async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) {
            return res.status(400).json({
                error: "Text is required for coding suggestions",
                code: "MISSING_TEXT",
            });
        }
        const suggestions = await naturalLanguageProcessingService.generateAutomatedCodingSuggestions(text, context);
        res.json({
            success: true,
            suggestions,
            summary: {
                totalSuggestions: suggestions.length,
                icd10Codes: suggestions.filter((s) => s.system === "ICD-10").length,
                cptCodes: suggestions.filter((s) => s.system === "CPT").length,
                snomedCodes: suggestions.filter((s) => s.system === "SNOMED-CT").length,
                loincCodes: suggestions.filter((s) => s.system === "LOINC").length,
                rxnormCodes: suggestions.filter((s) => s.system === "RxNorm").length,
            },
        });
    }
    catch (error) {
        console.error("Coding suggestions generation failed:", error);
        res.status(500).json({
            error: "Failed to generate coding suggestions",
            message: error.message,
        });
    }
});
// Analyze sentiment for patient satisfaction
router.post("/sentiment-analysis", async (req, res) => {
    try {
        const { text, language = "en" } = req.body;
        if (!text) {
            return res.status(400).json({
                error: "Text is required for sentiment analysis",
                code: "MISSING_TEXT",
            });
        }
        const sentimentResult = await naturalLanguageProcessingService.analyzeSentimentForSatisfaction(text, language);
        res.json({
            success: true,
            sentiment: sentimentResult,
            insights: {
                overallSentiment: sentimentResult.overallSentiment,
                satisfactionScore: sentimentResult.satisfactionScore,
                urgencyLevel: sentimentResult.urgencyLevel,
                dominantEmotion: Object.entries(sentimentResult.emotionalTone).sort(([, a], [, b]) => b - a)[0][0],
                keyPhrases: sentimentResult.keyPhrases.length,
            },
        });
    }
    catch (error) {
        console.error("Sentiment analysis failed:", error);
        res.status(500).json({
            error: "Failed to analyze sentiment",
            message: error.message,
        });
    }
});
// Process voice-to-text with medical terminology
router.post("/voice-to-text", async (req, res) => {
    try {
        const { audioData, language, medicalContext, speakerIdentification } = req.body;
        if (!audioData) {
            return res.status(400).json({
                error: "Audio data is required for voice-to-text processing",
                code: "MISSING_AUDIO",
            });
        }
        // Convert base64 audio data to Blob (simplified)
        const audioBlob = new Blob([Buffer.from(audioData, "base64")]);
        const result = await naturalLanguageProcessingService.processVoiceToText(audioBlob, {
            language,
            medicalContext,
            speakerIdentification,
        });
        res.json({
            success: true,
            result,
            processingInfo: {
                transcript: result.transcript,
                confidence: result.confidence,
                correctionsApplied: result.medicalTerminologyCorrections.length,
                processingTime: result.processingTime,
            },
        });
    }
    catch (error) {
        console.error("Voice-to-text processing failed:", error);
        res.status(500).json({
            error: "Failed to process voice-to-text",
            message: error.message,
        });
    }
});
// Multi-language processing
router.post("/translate", async (req, res) => {
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;
        if (!text || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({
                error: "Text, source language, and target language are required",
                code: "MISSING_PARAMETERS",
            });
        }
        const result = await naturalLanguageProcessingService.processMultiLanguage(text, sourceLanguage, targetLanguage);
        res.json({
            success: true,
            translation: result,
            qualityMetrics: {
                confidence: result.confidence,
                qualityScore: result.qualityScore,
                culturalAdaptations: result.culturalContext.culturalNotes.length,
            },
        });
    }
    catch (error) {
        console.error("Translation failed:", error);
        res.status(500).json({
            error: "Failed to translate text",
            message: error.message,
        });
    }
});
// Arabic language processing
router.post("/arabic-processing", async (req, res) => {
    try {
        const { text, includeTransliteration, medicalContext, dialectVariation } = req.body;
        if (!text) {
            return res.status(400).json({
                error: "Arabic text is required for processing",
                code: "MISSING_TEXT",
            });
        }
        const result = await naturalLanguageProcessingService.processArabicText(text, {
            includeTransliteration,
            medicalContext,
            dialectVariation,
        });
        res.json({
            success: true,
            result,
            processingInfo: {
                entitiesFound: result.entities.length,
                medicalTermsExtracted: result.medicalTerminology.length,
                transliterationProvided: !!result.transliteration,
                dialectNormalized: !!result.dialectNormalization,
            },
        });
    }
    catch (error) {
        console.error("Arabic text processing failed:", error);
        res.status(500).json({
            error: "Failed to process Arabic text",
            message: error.message,
        });
    }
});
// English medical text analysis
router.post("/english-medical-analysis", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                error: "English text is required for medical analysis",
                code: "MISSING_TEXT",
            });
        }
        const result = await naturalLanguageProcessingService.processEnglishMedicalText(text);
        res.json({
            success: true,
            analysis: result,
            summary: {
                entitiesFound: result.entities.length,
                conceptsIdentified: result.concepts.length,
                readabilityScore: result.medicalComplexity.readabilityScore,
                medicalTerminologyDensity: result.medicalComplexity.medicalTerminologyDensity,
                overallQuality: {
                    completeness: result.qualityMetrics.completeness,
                    accuracy: result.qualityMetrics.accuracy,
                    clarity: result.qualityMetrics.clarity,
                },
            },
        });
    }
    catch (error) {
        console.error("English medical text analysis failed:", error);
        res.status(500).json({
            error: "Failed to analyze English medical text",
            message: error.message,
        });
    }
});
// Medical text translation with accuracy focus
router.post("/medical-translate", async (req, res) => {
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;
        if (!text || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({
                error: "Text, source language, and target language are required",
                code: "MISSING_PARAMETERS",
            });
        }
        const result = await naturalLanguageProcessingService.translateMedicalText(text, sourceLanguage, targetLanguage);
        res.json({
            success: true,
            translation: result,
            qualityAssurance: {
                medicalAccuracy: result.qualityAssurance.medicalAccuracy,
                linguisticQuality: result.qualityAssurance.linguisticQuality,
                culturalAppropriateness: result.qualityAssurance.culturalAppropriateness,
                terminologyMappings: result.medicalTerminologyMappings.length,
            },
        });
    }
    catch (error) {
        console.error("Medical translation failed:", error);
        res.status(500).json({
            error: "Failed to translate medical text",
            message: error.message,
        });
    }
});
// Cultural context analysis
router.post("/cultural-context", async (req, res) => {
    try {
        const { text, language, region } = req.body;
        if (!text || !language) {
            return res.status(400).json({
                error: "Text and language are required for cultural context analysis",
                code: "MISSING_PARAMETERS",
            });
        }
        const insights = naturalLanguageProcessingService.getCulturalContextInsights(text, language, region);
        res.json({
            success: true,
            culturalInsights: insights,
            summary: {
                culturalMarkersFound: insights.culturalMarkers.length,
                communicationStyle: insights.communicationStyle,
                medicalConsiderations: {
                    healthBeliefs: insights.medicalCulturalConsiderations.healthBeliefs.length,
                    treatmentPreferences: insights.medicalCulturalConsiderations.treatmentPreferences.length,
                    communicationPreferences: insights.medicalCulturalConsiderations.communicationPreferences
                        .length,
                },
            },
        });
    }
    catch (error) {
        console.error("Cultural context analysis failed:", error);
        res.status(500).json({
            error: "Failed to analyze cultural context",
            message: error.message,
        });
    }
});
// NLP service health check
router.get("/health", async (req, res) => {
    try {
        res.json({
            success: true,
            service: "Natural Language Processing Service",
            status: "operational",
            capabilities: {
                clinicalNLP: true,
                sentimentAnalysis: true,
                voiceToText: true,
                multiLanguageSupport: true,
                arabicProcessing: true,
                englishMedicalAnalysis: true,
                medicalTranslation: true,
                culturalContext: true,
                codingSuggestions: true,
            },
            supportedLanguages: ["en", "ar"],
            supportedCodingSystems: ["ICD-10", "CPT", "SNOMED-CT", "LOINC", "RxNorm"],
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("NLP health check failed:", error);
        res.status(500).json({
            error: "NLP service health check failed",
            message: error.message,
        });
    }
});
export default router;
