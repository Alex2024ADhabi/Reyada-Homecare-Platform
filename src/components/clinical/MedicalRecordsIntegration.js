import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { FileText, Heart, Thermometer, Activity, Droplets, Pill, AlertTriangle, Clock, Save, } from "lucide-react";
const MedicalRecordsIntegration = ({ patientId, episodeId, readOnly = false, }) => {
    const [activeTab, setActiveTab] = useState("vital-signs");
    const [vitalSigns, setVitalSigns] = useState({
        temperature: "",
        pulse: "",
        bloodPressure: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        painLevel: "",
    });
    const [medicationRecord, setMedicationRecord] = useState({
        medicationName: "",
        dosage: "",
        route: "",
        frequency: "",
        administeredBy: "",
        administrationTime: "",
        patientResponse: "",
        sideEffects: "",
    });
    const [seizureRecord, setSeizureRecord] = useState({
        onsetTime: "",
        duration: "",
        frequency: "",
        type: "",
        description: "",
        triggeringFactors: "",
        interventions: "",
        postSeizureStatus: "",
    });
    const [woundAssessment, setWoundAssessment] = useState({
        location: "",
        size: {
            length: "",
            width: "",
            depth: "",
        },
        stage: "",
        appearance: "",
        drainage: "",
        treatment: "",
        healingProgress: "",
        photographTaken: false,
    });
    const [feedingChart, setFeedingChart] = useState({
        feedingType: "",
        rate: "",
        startTime: "",
        endTime: "",
        totalVolume: "",
        flushingVolume: "",
        preparation: "",
        tolerance: "",
        complications: "",
    });
    // Mock historical data based on the medical records PDF
    const historicalVitalSigns = [
        {
            date: "2025-05-24",
            time: "04:00",
            temperature: 36.0,
            pulse: 94,
            bloodPressure: "N/A",
            respiratoryRate: 20,
            oxygenSaturation: 96,
            recordedBy: "Shere Porras Gonzales",
        },
        {
            date: "2025-05-24",
            time: "00:00",
            temperature: 36.0,
            pulse: 100,
            bloodPressure: "N/A",
            respiratoryRate: 21,
            oxygenSaturation: 95,
            recordedBy: "Shere Porras Gonzales",
        },
        {
            date: "2025-05-23",
            time: "20:00",
            temperature: 36.1,
            pulse: 80,
            bloodPressure: "N/A",
            respiratoryRate: 20,
            oxygenSaturation: 95,
            recordedBy: "Shere Porras Gonzales",
        },
    ];
    const medicationHistory = [
        {
            date: "2025-05-25",
            time: "05:00",
            medication: "Esomeprazole",
            dosage: "10mg",
            route: "Enteral",
            frequency: "BID",
            administeredBy: "Shere Porras Gonzales",
            status: "Active",
        },
        {
            date: "2025-05-25",
            time: "04:00",
            medication: "Movicol pedia",
            dosage: "6.9g",
            route: "Enteral",
            frequency: "BID",
            administeredBy: "Shere Porras Gonzales",
            status: "Active",
        },
        {
            date: "2025-05-24",
            time: "21:00",
            medication: "Levetiracetam",
            dosage: "800mg",
            route: "Enteral",
            frequency: "BID",
            administeredBy: "Shere Porras Gonzales",
            status: "Active",
        },
    ];
    const seizureHistory = [
        {
            date: "2025-05-23",
            time: "18:07",
            duration: "14 seconds",
            frequency: "2nd",
            type: "Moderate",
            description: "Rigid extremities, eyes rolled up, facial flushing noted, stable vital signs, no triggering factor",
            recordedBy: "Shere Porras Gonzales",
        },
        {
            date: "2025-05-23",
            time: "06:30",
            duration: "16 seconds",
            frequency: "1st",
            type: "Moderate",
            description: "Rigid extremities, eyes rolled up, facial flushing noted, stable vital signs, no triggering factor",
            recordedBy: "Sarah Mae Valdez",
        },
    ];
    const handleSaveRecord = (recordType) => {
        // In a real implementation, this would save to the backend
        console.log(`Saving ${recordType} record:`, {
            patientId,
            episodeId,
            recordType,
            timestamp: new Date().toISOString(),
        });
        alert(`${recordType} record saved successfully!`);
    };
    const getVitalSignsStatus = (value, type) => {
        // Basic vital signs ranges for adults
        const ranges = {
            temperature: { min: 36.1, max: 37.2 },
            pulse: { min: 60, max: 100 },
            respiratoryRate: { min: 12, max: 20 },
            oxygenSaturation: { min: 95, max: 100 },
        };
        const range = ranges[type];
        if (!range)
            return "normal";
        if (value < range.min)
            return "low";
        if (value > range.max)
            return "high";
        return "normal";
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "low":
                return "text-blue-600 bg-blue-100";
            case "high":
                return "text-red-600 bg-red-100";
            case "normal":
                return "text-green-600 bg-green-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };
    return (_jsxs("div", { className: "space-y-6 bg-white", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-600" }), "Medical Records Integration"] }), _jsx(CardDescription, { children: "Comprehensive medical documentation based on DOH standards and clinical best practices" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Patient ID" }), _jsx("p", { className: "font-medium", children: patientId })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Episode ID" }), _jsx("p", { className: "font-medium", children: episodeId || "N/A" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-gray-600", children: "Last Updated" }), _jsx("p", { className: "font-medium", children: new Date().toLocaleDateString() })] })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsxs(TabsTrigger, { value: "vital-signs", children: [_jsx(Heart, { className: "w-4 h-4 mr-2" }), "Vital Signs"] }), _jsxs(TabsTrigger, { value: "medications", children: [_jsx(Pill, { className: "w-4 h-4 mr-2" }), "Medications"] }), _jsxs(TabsTrigger, { value: "seizure-monitoring", children: [_jsx(Activity, { className: "w-4 h-4 mr-2" }), "Seizures"] }), _jsxs(TabsTrigger, { value: "wound-care", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "Wounds"] }), _jsxs(TabsTrigger, { value: "feeding", children: [_jsx(Droplets, { className: "w-4 h-4 mr-2" }), "Feeding"] }), _jsxs(TabsTrigger, { value: "history", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), "History"] })] }), _jsx(TabsContent, { value: "vital-signs", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Vital Signs Recording" }), _jsx(CardDescription, { children: "Record current vital signs with automatic range validation" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "temperature", children: ["Temperature (\u00B0C)", _jsx(Thermometer, { className: "w-4 h-4 inline ml-1" })] }), _jsx(Input, { id: "temperature", type: "number", step: "0.1", value: vitalSigns.temperature, onChange: (e) => setVitalSigns({
                                                                ...vitalSigns,
                                                                temperature: e.target.value,
                                                            }), placeholder: "36.5", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "pulse", children: ["Pulse (bpm)", _jsx(Heart, { className: "w-4 h-4 inline ml-1" })] }), _jsx(Input, { id: "pulse", type: "number", value: vitalSigns.pulse, onChange: (e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value }), placeholder: "80", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bloodPressure", children: "Blood Pressure (mmHg)" }), _jsx(Input, { id: "bloodPressure", value: vitalSigns.bloodPressure, onChange: (e) => setVitalSigns({
                                                                ...vitalSigns,
                                                                bloodPressure: e.target.value,
                                                            }), placeholder: "120/80", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "respiratoryRate", children: "Respiratory Rate (breaths/min)" }), _jsx(Input, { id: "respiratoryRate", type: "number", value: vitalSigns.respiratoryRate, onChange: (e) => setVitalSigns({
                                                                ...vitalSigns,
                                                                respiratoryRate: e.target.value,
                                                            }), placeholder: "16", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "oxygenSaturation", children: "Oxygen Saturation (%)" }), _jsx(Input, { id: "oxygenSaturation", type: "number", value: vitalSigns.oxygenSaturation, onChange: (e) => setVitalSigns({
                                                                ...vitalSigns,
                                                                oxygenSaturation: e.target.value,
                                                            }), placeholder: "98", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "weight", children: "Weight (kg)" }), _jsx(Input, { id: "weight", type: "number", step: "0.1", value: vitalSigns.weight, onChange: (e) => setVitalSigns({ ...vitalSigns, weight: e.target.value }), placeholder: "70.5", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "height", children: "Height (cm)" }), _jsx(Input, { id: "height", type: "number", value: vitalSigns.height, onChange: (e) => setVitalSigns({ ...vitalSigns, height: e.target.value }), placeholder: "170", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "painLevel", children: "Pain Level (0-10)" }), _jsxs(Select, { value: vitalSigns.painLevel, onValueChange: (value) => setVitalSigns({ ...vitalSigns, painLevel: value }), disabled: readOnly, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select pain level" }) }), _jsx(SelectContent, { children: Array.from({ length: 11 }, (_, i) => (_jsxs(SelectItem, { value: i.toString(), children: [i, " -", " ", i === 0
                                                                                ? "No Pain"
                                                                                : i <= 3
                                                                                    ? "Mild"
                                                                                    : i <= 6
                                                                                        ? "Moderate"
                                                                                        : "Severe"] }, i))) })] })] })] }), !readOnly && (_jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { onClick: () => handleSaveRecord("Vital Signs"), children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Vital Signs"] }) }))] })] }) }), _jsx(TabsContent, { value: "medications", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Medication Administration Record" }), _jsx(CardDescription, { children: "Document medication administration with safety checks" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medicationName", children: "Medication Name *" }), _jsx(Input, { id: "medicationName", value: medicationRecord.medicationName, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                medicationName: e.target.value,
                                                            }), placeholder: "e.g., Esomeprazole", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "dosage", children: "Dosage *" }), _jsx(Input, { id: "dosage", value: medicationRecord.dosage, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                dosage: e.target.value,
                                                            }), placeholder: "e.g., 10mg", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "route", children: "Route of Administration *" }), _jsxs(Select, { value: medicationRecord.route, onValueChange: (value) => setMedicationRecord({ ...medicationRecord, route: value }), disabled: readOnly, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select route" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "oral", children: "Oral" }), _jsx(SelectItem, { value: "enteral", children: "Enteral" }), _jsx(SelectItem, { value: "iv", children: "Intravenous" }), _jsx(SelectItem, { value: "im", children: "Intramuscular" }), _jsx(SelectItem, { value: "sc", children: "Subcutaneous" }), _jsx(SelectItem, { value: "topical", children: "Topical" }), _jsx(SelectItem, { value: "inhalation", children: "Inhalation" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "frequency", children: "Frequency *" }), _jsxs(Select, { value: medicationRecord.frequency, onValueChange: (value) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                frequency: value,
                                                            }), disabled: readOnly, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select frequency" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "OD", children: "Once Daily (OD)" }), _jsx(SelectItem, { value: "BID", children: "Twice Daily (BID)" }), _jsx(SelectItem, { value: "TID", children: "Three Times Daily (TID)" }), _jsx(SelectItem, { value: "QID", children: "Four Times Daily (QID)" }), _jsx(SelectItem, { value: "PRN", children: "As Needed (PRN)" }), _jsx(SelectItem, { value: "STAT", children: "Immediately (STAT)" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "administeredBy", children: "Administered By *" }), _jsx(Input, { id: "administeredBy", value: medicationRecord.administeredBy, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                administeredBy: e.target.value,
                                                            }), placeholder: "Healthcare provider name", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "administrationTime", children: "Administration Time *" }), _jsx(Input, { id: "administrationTime", type: "datetime-local", value: medicationRecord.administrationTime, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                administrationTime: e.target.value,
                                                            }), disabled: readOnly })] })] }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patientResponse", children: "Patient Response" }), _jsx(Textarea, { id: "patientResponse", value: medicationRecord.patientResponse, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                patientResponse: e.target.value,
                                                            }), placeholder: "Document patient's response to medication", className: "h-20", disabled: readOnly })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "sideEffects", children: "Side Effects/Adverse Reactions" }), _jsx(Textarea, { id: "sideEffects", value: medicationRecord.sideEffects, onChange: (e) => setMedicationRecord({
                                                                ...medicationRecord,
                                                                sideEffects: e.target.value,
                                                            }), placeholder: "Document any side effects or adverse reactions", className: "h-20", disabled: readOnly })] })] }), !readOnly && (_jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { onClick: () => handleSaveRecord("Medication"), children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Medication Record"] }) }))] })] }) }), _jsxs(TabsContent, { value: "history", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Vital Signs" }) }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date/Time" }), _jsx(TableHead, { children: "Temp" }), _jsx(TableHead, { children: "Pulse" }), _jsx(TableHead, { children: "SpO2" }), _jsx(TableHead, { children: "RR" })] }) }), _jsx(TableBody, { children: historicalVitalSigns.map((record, index) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: "font-medium", children: [record.date, _jsx("br", {}), _jsx("span", { className: "text-sm text-gray-500", children: record.time })] }), _jsx(TableCell, { children: _jsxs(Badge, { className: getStatusColor(getVitalSignsStatus(record.temperature, "temperature")), children: [record.temperature, "\u00B0C"] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getStatusColor(getVitalSignsStatus(record.pulse, "pulse")), children: record.pulse }) }), _jsx(TableCell, { children: _jsxs(Badge, { className: getStatusColor(getVitalSignsStatus(record.oxygenSaturation, "oxygenSaturation")), children: [record.oxygenSaturation, "%"] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getStatusColor(getVitalSignsStatus(record.respiratoryRate, "respiratoryRate")), children: record.respiratoryRate }) })] }, index))) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Medications" }) }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date/Time" }), _jsx(TableHead, { children: "Medication" }), _jsx(TableHead, { children: "Dosage" }), _jsx(TableHead, { children: "Status" })] }) }), _jsx(TableBody, { children: medicationHistory.map((record, index) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: "font-medium", children: [record.date, _jsx("br", {}), _jsx("span", { className: "text-sm text-gray-500", children: record.time })] }), _jsx(TableCell, { children: record.medication }), _jsxs(TableCell, { children: [record.dosage, " (", record.route, ")"] }), _jsx(TableCell, { children: _jsx(Badge, { className: record.status === "Active"
                                                                                ? "text-green-700 bg-green-100"
                                                                                : "text-gray-700 bg-gray-100", children: record.status }) })] }, index))) })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Seizure History" }) }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date/Time" }), _jsx(TableHead, { children: "Duration" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Recorded By" })] }) }), _jsx(TableBody, { children: seizureHistory.map((record, index) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: "font-medium", children: [record.date, _jsx("br", {}), _jsx("span", { className: "text-sm text-gray-500", children: record.time })] }), _jsx(TableCell, { children: record.duration }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: record.type }) }), _jsx(TableCell, { className: "max-w-xs truncate", children: record.description }), _jsx(TableCell, { className: "text-sm text-gray-600", children: record.recordedBy })] }, index))) })] }) })] })] })] })] }));
};
export default MedicalRecordsIntegration;
