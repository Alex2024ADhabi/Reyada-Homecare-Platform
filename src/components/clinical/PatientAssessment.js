import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, } from "@/components/ui/dialog";
import { Calendar, Clock, Users, Clipboard, Shield, Activity, Stethoscope, MapPin, Check, AlertCircle, Save, } from "lucide-react";
const PatientAssessment = ({ patientId = "P12345", referralId = "REF789", isOffline = false, }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [activeProcess, setActiveProcess] = useState("medical-records");
    // Mock assessment data
    const [assessment, setAssessment] = useState({
        id: "ASS001",
        patientId: patientId,
        referralId: referralId,
        assignedStaff: [],
        medicalRecordsCollected: false,
        dischargeSummaryAvailable: false,
        labResultsAvailable: false,
        imagingReportsAvailable: false,
        medicationListAvailable: false,
        specialistNotesAvailable: false,
        insuranceAuthorizationAvailable: false,
        nursingAssessmentCompleted: false,
        infectionControlAssessmentCompleted: false,
        ptAssessmentRequired: false,
        ptAssessmentCompleted: false,
        otAssessmentRequired: false,
        otAssessmentCompleted: false,
        stAssessmentRequired: false,
        stAssessmentCompleted: false,
        rtAssessmentRequired: false,
        rtAssessmentCompleted: false,
        followUpRequired: false,
        assessmentStatus: "Scheduled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    // Mock staff data
    const availableStaff = [
        {
            id: "S001",
            name: "Dr. Sarah Ahmed",
            role: "Head Nurse",
            available: true,
        },
        {
            id: "S002",
            name: "Fatima Al Hashemi",
            role: "Nurse Supervisor",
            available: true,
        },
        {
            id: "S003",
            name: "Mohammed Al Zaabi",
            role: "Charge Nurse",
            available: false,
        },
        {
            id: "S004",
            name: "Aisha Al Suwaidi",
            role: "Infection Control Officer",
            available: true,
        },
        {
            id: "S005",
            name: "Khalid Al Mansouri",
            role: "Therapist Supervisor",
            available: true,
        },
        {
            id: "S006",
            name: "Noura Al Marzouqi",
            role: "Physical Therapist",
            specialty: "Neurological",
            available: true,
        },
        {
            id: "S007",
            name: "Ahmed Al Dhaheri",
            role: "Occupational Therapist",
            available: false,
        },
        {
            id: "S008",
            name: "Maryam Al Shamsi",
            role: "Speech Therapist",
            available: true,
        },
        {
            id: "S009",
            name: "Omar Al Nuaimi",
            role: "Respiratory Therapist",
            available: true,
        },
    ];
    const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
    const [isStaffAssignmentDialogOpen, setIsStaffAssignmentDialogOpen] = useState(false);
    const calculateCompletionPercentage = () => {
        let totalFields = 0;
        let completedFields = 0;
        // Pre-Assessment Requirements
        if (assessment.medicalRecordsCollected)
            completedFields++;
        totalFields++;
        // Required documents
        if (assessment.dischargeSummaryAvailable)
            completedFields++;
        if (assessment.labResultsAvailable)
            completedFields++;
        if (assessment.imagingReportsAvailable)
            completedFields++;
        if (assessment.medicationListAvailable)
            completedFields++;
        if (assessment.specialistNotesAvailable)
            completedFields++;
        if (assessment.insuranceAuthorizationAvailable)
            completedFields++;
        totalFields += 6;
        // Assessment Components
        if (assessment.nursingAssessmentCompleted)
            completedFields++;
        totalFields++;
        if (assessment.infectionControlAssessmentCompleted)
            completedFields++;
        totalFields++;
        if (assessment.ptAssessmentRequired) {
            totalFields++;
            if (assessment.ptAssessmentCompleted)
                completedFields++;
        }
        if (assessment.otAssessmentRequired) {
            totalFields++;
            if (assessment.otAssessmentCompleted)
                completedFields++;
        }
        if (assessment.stAssessmentRequired) {
            totalFields++;
            if (assessment.stAssessmentCompleted)
                completedFields++;
        }
        if (assessment.rtAssessmentRequired) {
            totalFields++;
            if (assessment.rtAssessmentCompleted)
                completedFields++;
        }
        // Assessment Results
        if (assessment.recommendedLevelOfCare)
            completedFields++;
        if (assessment.recommendedServices &&
            assessment.recommendedServices.length > 0)
            completedFields++;
        if (assessment.functionalStatusScore)
            completedFields++;
        if (assessment.bradenScaleScore)
            completedFields++;
        if (assessment.morseFallScaleScore)
            completedFields++;
        if (assessment.familyCaregiverCapability)
            completedFields++;
        totalFields += 6;
        // Geographic and Logistics
        if (assessment.patientAddress)
            completedFields++;
        if (assessment.geographicZone)
            completedFields++;
        if (assessment.travelTimeEstimate)
            completedFields++;
        totalFields += 3;
        return Math.round((completedFields / totalFields) * 100);
    };
    const completionPercentage = calculateCompletionPercentage();
    const handleScheduleAssessment = () => {
        // In a real implementation, this would save the assessment date and time
        setIsSchedulingDialogOpen(false);
        // Update the assessment with the new date and time
        setAssessment((prev) => ({
            ...prev,
            assessmentDate: "2023-07-15",
            assessmentTime: "10:00",
            estimatedDuration: 120,
            assessmentStatus: "Scheduled",
            updatedAt: new Date().toISOString(),
        }));
    };
    const handleAssignStaff = () => {
        // In a real implementation, this would save the assigned staff
        setIsStaffAssignmentDialogOpen(false);
        // Update the assessment with the assigned staff
        setAssessment((prev) => ({
            ...prev,
            assignedStaff: [
                availableStaff[0], // Head Nurse
                availableStaff[3], // Infection Control Officer
                availableStaff[5], // Physical Therapist
            ],
            updatedAt: new Date().toISOString(),
        }));
    };
    const handleSaveAssessment = () => {
        // In a real implementation, this would save the assessment to the database
        if (isOffline) {
            alert("Assessment saved locally. Will sync when online connection is restored.");
        }
        else {
            alert("Assessment saved successfully.");
        }
    };
    const handleToggleRequirement = (field, value) => {
        setAssessment((prev) => ({
            ...prev,
            [field]: value,
            updatedAt: new Date().toISOString(),
        }));
    };
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Patient Assessment" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs(Badge, { variant: "outline", children: ["Patient ID: ", patientId] }), _jsxs(Badge, { variant: "outline", children: ["Referral ID: ", referralId] }), _jsx(Badge, { variant: assessment.assessmentStatus === "Completed"
                                            ? "success"
                                            : assessment.assessmentStatus === "In Progress"
                                                ? "default"
                                                : assessment.assessmentStatus === "Cancelled"
                                                    ? "destructive"
                                                    : "outline", children: assessment.assessmentStatus })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Dialog, { open: isSchedulingDialogOpen, onOpenChange: setIsSchedulingDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Schedule Assessment"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Schedule Patient Assessment" }) }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-date", children: "Assessment Date" }), _jsx(Input, { id: "assessment-date", type: "date" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-time", children: "Assessment Time" }), _jsx(Input, { id: "assessment-time", type: "time" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "estimated-duration", children: "Estimated Duration (minutes)" }), _jsx(Input, { id: "estimated-duration", type: "number", defaultValue: "120" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-notes", children: "Notes" }), _jsx(Textarea, { id: "assessment-notes", placeholder: "Enter any special instructions or notes for this assessment" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsSchedulingDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleScheduleAssessment, children: "Schedule" })] })] })] }), _jsxs(Dialog, { open: isStaffAssignmentDialogOpen, onOpenChange: setIsStaffAssignmentDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "Assign Staff"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Assign Staff to Assessment" }) }), _jsx("div", { className: "py-4", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-12", children: "Select" }), _jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "Specialty" }), _jsx(TableHead, { children: "Availability" })] }) }), _jsx(TableBody, { children: availableStaff.map((staff) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Checkbox, { id: `staff-${staff.id}` }) }), _jsx(TableCell, { children: staff.name }), _jsx(TableCell, { children: staff.role }), _jsx(TableCell, { children: staff.specialty || "-" }), _jsx(TableCell, { children: _jsx(Badge, { variant: staff.available ? "outline" : "destructive", children: staff.available ? "Available" : "Unavailable" }) })] }, staff.id))) })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsStaffAssignmentDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleAssignStaff, children: "Assign Selected Staff" })] })] })] }), _jsxs(Button, { onClick: handleSaveAssessment, children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), "Save Assessment"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Assessment Processes" }), _jsx(CardDescription, { children: "Complete the 5 assessment processes as required by DOH standards" })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeProcess, onValueChange: setActiveProcess, children: [_jsxs(TabsList, { className: "grid grid-cols-5 mb-4", children: [_jsxs(TabsTrigger, { value: "medical-records", children: [_jsx(Clipboard, { className: "h-4 w-4 mr-2" }), "Medical Records"] }), _jsxs(TabsTrigger, { value: "home-assessment", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2" }), "Home Assessment"] }), _jsxs(TabsTrigger, { value: "infection-control", children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Infection Control"] }), _jsxs(TabsTrigger, { value: "clinical-assessment", children: [_jsx(Stethoscope, { className: "h-4 w-4 mr-2" }), "Clinical Assessment"] }), _jsxs(TabsTrigger, { value: "therapy-assessment", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Therapy Assessment"] })] }), _jsxs(TabsContent, { value: "medical-records", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Medical Records Collection" }), _jsx(Badge, { variant: assessment.medicalRecordsCollected
                                                                    ? "success"
                                                                    : "outline", children: assessment.medicalRecordsCollected
                                                                    ? "Collected"
                                                                    : "Pending" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Ensure to collect the updated Medical Reports of the patient before the assessment for any new referral. This includes discharge summaries, laboratory results, imaging reports, medication lists, and any specialist consultations from the past 30 days." }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Required Documents" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "discharge-summary", checked: assessment.dischargeSummaryAvailable, onCheckedChange: (checked) => handleToggleRequirement("dischargeSummaryAvailable", checked === true) }), _jsx(Label, { htmlFor: "discharge-summary", children: "Discharge summary from referring hospital" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "lab-results", checked: assessment.labResultsAvailable, onCheckedChange: (checked) => handleToggleRequirement("labResultsAvailable", checked === true) }), _jsx(Label, { htmlFor: "lab-results", children: "Laboratory results (last 30 days)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "imaging-reports", checked: assessment.imagingReportsAvailable, onCheckedChange: (checked) => handleToggleRequirement("imagingReportsAvailable", checked === true) }), _jsx(Label, { htmlFor: "imaging-reports", children: "Imaging reports and studies" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "medication-list", checked: assessment.medicationListAvailable, onCheckedChange: (checked) => handleToggleRequirement("medicationListAvailable", checked === true) }), _jsx(Label, { htmlFor: "medication-list", children: "Current medication list with dosages" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "specialist-notes", checked: assessment.specialistNotesAvailable, onCheckedChange: (checked) => handleToggleRequirement("specialistNotesAvailable", checked === true) }), _jsx(Label, { htmlFor: "specialist-notes", children: "Specialist consultation notes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "insurance-authorization", checked: assessment.insuranceAuthorizationAvailable, onCheckedChange: (checked) => handleToggleRequirement("insuranceAuthorizationAvailable", checked === true) }), _jsx(Label, { htmlFor: "insurance-authorization", children: "Insurance authorization documents" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsx(Checkbox, { id: "medical-records-collected", checked: assessment.medicalRecordsCollected, onCheckedChange: (checked) => handleToggleRequirement("medicalRecordsCollected", checked === true) }), _jsx(Label, { htmlFor: "medical-records-collected", className: "font-medium", children: "I confirm all required medical records have been collected" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "collection-date", children: "Collection Date" }), _jsx(Input, { id: "collection-date", type: "date", value: assessment.medicalRecordsCollectionDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            medicalRecordsCollectionDate: e.target.value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "collected-by", children: "Collected By" }), _jsxs(Select, { value: assessment.medicalRecordsCollectedBy || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            medicalRecordsCollectedBy: value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })), children: [_jsx(SelectTrigger, { id: "collected-by", children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                    .filter((staff) => staff.role === "Head Nurse" ||
                                                                                    staff.role === "Nurse Supervisor")
                                                                                    .map((staff) => (_jsxs(SelectItem, { value: staff.id, children: [staff.name, " (", staff.role, ")"] }, staff.id))) })] })] })] })] }), _jsxs(TabsContent, { value: "home-assessment", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Home Assessment Coordination" }), _jsx(Badge, { variant: "outline", children: assessment.assessmentDate
                                                                    ? "Scheduled"
                                                                    : "Not Scheduled" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Coordinate and schedule face-to-face home assessment visits ensuring appropriate clinical staff assignment based on patient needs and geographic location. Manage assessment logistics including transportation, equipment requirements, and family availability." }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Scheduling Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Assessment Date" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: assessment.assessmentDate || "Not scheduled" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Assessment Time" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: assessment.assessmentTime || "Not scheduled" })] })] })] })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Geographic Information" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patient-address", children: "Patient Address" }), _jsx(Textarea, { id: "patient-address", placeholder: "Enter patient's full address", value: assessment.patientAddress || "", onChange: (e) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    patientAddress: e.target.value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "geographic-zone", children: "Geographic Zone" }), _jsxs(Select, { value: assessment.geographicZone || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                            ...prev,
                                                                                            geographicZone: value,
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })), children: [_jsx(SelectTrigger, { id: "geographic-zone", children: _jsx(SelectValue, { placeholder: "Select zone" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "north", children: "North Zone" }), _jsx(SelectItem, { value: "south", children: "South Zone" }), _jsx(SelectItem, { value: "east", children: "East Zone" }), _jsx(SelectItem, { value: "west", children: "West Zone" }), _jsx(SelectItem, { value: "central", children: "Central Zone" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "travel-time", children: "Estimated Travel Time (minutes)" }), _jsx(Input, { id: "travel-time", type: "number", placeholder: "30", value: assessment.travelTimeEstimate || "", onChange: (e) => setAssessment((prev) => ({
                                                                                            ...prev,
                                                                                            travelTimeEstimate: parseInt(e.target.value),
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parking-availability", children: "Parking Availability" }), _jsxs(Select, { value: assessment.parkingAvailability || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    parkingAvailability: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "parking-availability", children: _jsx(SelectValue, { placeholder: "Select parking option" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ample", children: "Ample Parking" }), _jsx(SelectItem, { value: "limited", children: "Limited Parking" }), _jsx(SelectItem, { value: "street", children: "Street Parking Only" }), _jsx(SelectItem, { value: "none", children: "No Parking Available" }), _jsx(SelectItem, { value: "paid", children: "Paid Parking" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "home-access-notes", children: "Home Access Notes" }), _jsx(Textarea, { id: "home-access-notes", placeholder: "Enter any special instructions for accessing the home", value: assessment.homeAccessNotes || "", onChange: (e) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    homeAccessNotes: e.target.value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] })] })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Assigned Staff" }), assessment.assignedStaff.length > 0 ? (_jsx("div", { className: "space-y-2", children: assessment.assignedStaff.map((staff) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-background rounded-md", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: staff.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: staff.role })] }), _jsx(Badge, { variant: "outline", children: staff.specialty || staff.role })] }, staff.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground", children: "No staff assigned yet. Use the \"Assign Staff\" button to assign staff members." }))] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Equipment Preparation" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "special-equipment", children: "Special Equipment Needed" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-wheelchair" }), _jsx(Label, { htmlFor: "equipment-wheelchair", children: "Wheelchair" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-oxygen" }), _jsx(Label, { htmlFor: "equipment-oxygen", children: "Oxygen Equipment" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-vitals" }), _jsx(Label, { htmlFor: "equipment-vitals", children: "Vital Signs Equipment" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-wound" }), _jsx(Label, { htmlFor: "equipment-wound", children: "Wound Care Kit" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-assessment" }), _jsx(Label, { htmlFor: "equipment-assessment", children: "Assessment Forms" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "visit-frequency", children: "Recommended Visit Frequency" }), _jsxs(Select, { value: assessment.recommendedVisitFrequency || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    recommendedVisitFrequency: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "visit-frequency", children: _jsx(SelectValue, { placeholder: "Select frequency" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "daily", children: "Daily" }), _jsx(SelectItem, { value: "twice-weekly", children: "Twice Weekly" }), _jsx(SelectItem, { value: "weekly", children: "Weekly" }), _jsx(SelectItem, { value: "biweekly", children: "Bi-weekly" }), _jsx(SelectItem, { value: "monthly", children: "Monthly" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "visit-duration", children: "Estimated Visit Duration (minutes)" }), _jsx(Input, { id: "visit-duration", type: "number", placeholder: "60", value: assessment.estimatedVisitDuration || "", onChange: (e) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    estimatedVisitDuration: parseInt(e.target.value),
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] })] })] })] }), _jsxs(TabsContent, { value: "infection-control", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Infection Control Assessment" }), _jsx(Badge, { variant: assessment.infectionControlAssessmentCompleted
                                                                    ? "success"
                                                                    : "outline", children: assessment.infectionControlAssessmentCompleted
                                                                    ? "Completed"
                                                                    : "Pending" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Conduct infection control risk assessment for all new patients including review of infectious disease history, current isolation requirements, and home environment safety for healthcare workers." }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Infection Control Risk Assessment" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "infection-risk-level", children: "Risk Level" }), _jsxs(Select, { value: assessment.infectionControlRiskLevel || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    infectionControlRiskLevel: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "infection-risk-level", children: _jsx(SelectValue, { placeholder: "Select risk level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Low", children: "Low Risk" }), _jsx(SelectItem, { value: "Medium", children: "Medium Risk" }), _jsx(SelectItem, { value: "High", children: "High Risk" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "PPE Requirements" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ppe-gloves", onCheckedChange: (checked) => {
                                                                                                    const currentPPE = assessment.ppeRequirements || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: [...currentPPE, "Gloves"],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: currentPPE.filter((item) => item !== "Gloves"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.ppeRequirements || []).includes("Gloves") }), _jsx(Label, { htmlFor: "ppe-gloves", children: "Gloves" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ppe-mask", onCheckedChange: (checked) => {
                                                                                                    const currentPPE = assessment.ppeRequirements || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: [
                                                                                                                ...currentPPE,
                                                                                                                "Surgical Mask",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: currentPPE.filter((item) => item !== "Surgical Mask"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.ppeRequirements || []).includes("Surgical Mask") }), _jsx(Label, { htmlFor: "ppe-mask", children: "Surgical Mask" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ppe-n95", onCheckedChange: (checked) => {
                                                                                                    const currentPPE = assessment.ppeRequirements || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: [
                                                                                                                ...currentPPE,
                                                                                                                "N95 Respirator",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: currentPPE.filter((item) => item !== "N95 Respirator"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.ppeRequirements || []).includes("N95 Respirator") }), _jsx(Label, { htmlFor: "ppe-n95", children: "N95 Respirator" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ppe-gown", onCheckedChange: (checked) => {
                                                                                                    const currentPPE = assessment.ppeRequirements || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: [
                                                                                                                ...currentPPE,
                                                                                                                "Isolation Gown",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: currentPPE.filter((item) => item !== "Isolation Gown"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.ppeRequirements || []).includes("Isolation Gown") }), _jsx(Label, { htmlFor: "ppe-gown", children: "Isolation Gown" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ppe-eye", onCheckedChange: (checked) => {
                                                                                                    const currentPPE = assessment.ppeRequirements || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: [
                                                                                                                ...currentPPE,
                                                                                                                "Eye Protection",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            ppeRequirements: currentPPE.filter((item) => item !== "Eye Protection"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.ppeRequirements || []).includes("Eye Protection") }), _jsx(Label, { htmlFor: "ppe-eye", children: "Eye Protection" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "infection-control-notes", children: "Infection Control Notes" }), _jsx(Textarea, { id: "infection-control-notes", placeholder: "Enter any specific infection control notes or concerns" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsx(Checkbox, { id: "infection-control-completed", checked: assessment.infectionControlAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("infectionControlAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "infection-control-completed", className: "font-medium", children: "I confirm the infection control assessment has been completed" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "infection-control-date", children: "Assessment Date" }), _jsx(Input, { id: "infection-control-date", type: "date", value: assessment.infectionControlDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            infectionControlDate: e.target.value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "infection-control-officer", children: "Infection Control Officer" }), _jsxs(Select, { value: assessment.infectionControlOfficer || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            infectionControlOfficer: value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })), children: [_jsx(SelectTrigger, { id: "infection-control-officer", children: _jsx(SelectValue, { placeholder: "Select officer" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                    .filter((staff) => staff.role === "Infection Control Officer")
                                                                                    .map((staff) => (_jsx(SelectItem, { value: staff.id, children: staff.name }, staff.id))) })] })] })] })] }), _jsxs(TabsContent, { value: "clinical-assessment", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Clinical Assessment Execution" }), _jsx(Badge, { variant: assessment.nursingAssessmentCompleted
                                                                    ? "success"
                                                                    : "outline", children: assessment.nursingAssessmentCompleted
                                                                    ? "Completed"
                                                                    : "Pending" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Execute comprehensive clinical assessment including physical examination, functional assessment, psychosocial evaluation, and family/caregiver assessment to determine appropriate level of care and service requirements." }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Clinical Assessment Components" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "braden-scale", children: "Braden Scale Score" }), _jsx(Input, { id: "braden-scale", type: "number", min: "6", max: "23", placeholder: "6-23", value: assessment.bradenScaleScore || "", onChange: (e) => setAssessment((prev) => ({
                                                                                            ...prev,
                                                                                            bradenScaleScore: parseInt(e.target.value),
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "morse-fall", children: "Morse Fall Scale Score" }), _jsx(Input, { id: "morse-fall", type: "number", min: "0", max: "125", placeholder: "0-125", value: assessment.morseFallScaleScore || "", onChange: (e) => setAssessment((prev) => ({
                                                                                            ...prev,
                                                                                            morseFallScaleScore: parseInt(e.target.value),
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "functional-status", children: "Functional Status Score" }), _jsx(Input, { id: "functional-status", type: "number", min: "0", max: "100", placeholder: "0-100", value: assessment.functionalStatusScore || "", onChange: (e) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    functionalStatusScore: parseInt(e.target.value),
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "caregiver-capability", children: "Family/Caregiver Capability" }), _jsxs(Select, { value: assessment.familyCaregiverCapability || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    familyCaregiverCapability: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "caregiver-capability", children: _jsx(SelectValue, { placeholder: "Select capability level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Low", children: "Low Capability" }), _jsx(SelectItem, { value: "Medium", children: "Medium Capability" }), _jsx(SelectItem, { value: "High", children: "High Capability" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "recommended-care", children: "Recommended Level of Care" }), _jsxs(Select, { value: assessment.recommendedLevelOfCare || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                    ...prev,
                                                                                    recommendedLevelOfCare: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "recommended-care", children: _jsx(SelectValue, { placeholder: "Select care level" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low-intensity", children: "Low Intensity" }), _jsx(SelectItem, { value: "medium-intensity", children: "Medium Intensity" }), _jsx(SelectItem, { value: "high-intensity", children: "High Intensity" }), _jsx(SelectItem, { value: "specialized", children: "Specialized Care" }), _jsx(SelectItem, { value: "palliative", children: "Palliative Care" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Recommended Services" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-nursing", onCheckedChange: (checked) => {
                                                                                                    const currentServices = assessment.recommendedServices || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: [
                                                                                                                ...currentServices,
                                                                                                                "Nursing Care",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: currentServices.filter((item) => item !== "Nursing Care"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.recommendedServices || []).includes("Nursing Care") }), _jsx(Label, { htmlFor: "service-nursing", children: "Nursing Care" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-pt", onCheckedChange: (checked) => {
                                                                                                    const currentServices = assessment.recommendedServices || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: [
                                                                                                                ...currentServices,
                                                                                                                "Physical Therapy",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: currentServices.filter((item) => item !== "Physical Therapy"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.recommendedServices || []).includes("Physical Therapy") }), _jsx(Label, { htmlFor: "service-pt", children: "Physical Therapy" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-ot", onCheckedChange: (checked) => {
                                                                                                    const currentServices = assessment.recommendedServices || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: [
                                                                                                                ...currentServices,
                                                                                                                "Occupational Therapy",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: currentServices.filter((item) => item !== "Occupational Therapy"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.recommendedServices || []).includes("Occupational Therapy") }), _jsx(Label, { htmlFor: "service-ot", children: "Occupational Therapy" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-st", onCheckedChange: (checked) => {
                                                                                                    const currentServices = assessment.recommendedServices || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: [
                                                                                                                ...currentServices,
                                                                                                                "Speech Therapy",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: currentServices.filter((item) => item !== "Speech Therapy"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.recommendedServices || []).includes("Speech Therapy") }), _jsx(Label, { htmlFor: "service-st", children: "Speech Therapy" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-rt", onCheckedChange: (checked) => {
                                                                                                    const currentServices = assessment.recommendedServices || [];
                                                                                                    if (checked) {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: [
                                                                                                                ...currentServices,
                                                                                                                "Respiratory Therapy",
                                                                                                            ],
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                    else {
                                                                                                        setAssessment((prev) => ({
                                                                                                            ...prev,
                                                                                                            recommendedServices: currentServices.filter((item) => item !== "Respiratory Therapy"),
                                                                                                            updatedAt: new Date().toISOString(),
                                                                                                        }));
                                                                                                    }
                                                                                                }, checked: (assessment.recommendedServices || []).includes("Respiratory Therapy") }), _jsx(Label, { htmlFor: "service-rt", children: "Respiratory Therapy" })] })] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-4", children: [_jsx(Checkbox, { id: "nursing-assessment-completed", checked: assessment.nursingAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("nursingAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "nursing-assessment-completed", className: "font-medium", children: "I confirm the clinical assessment has been completed" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "nursing-assessment-date", children: "Assessment Date" }), _jsx(Input, { id: "nursing-assessment-date", type: "date", value: assessment.nursingAssessmentDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            nursingAssessmentDate: e.target.value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "nursing-assessor", children: "Assessor" }), _jsxs(Select, { value: assessment.nursingAssessor || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                            ...prev,
                                                                            nursingAssessor: value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })), children: [_jsx(SelectTrigger, { id: "nursing-assessor", children: _jsx(SelectValue, { placeholder: "Select assessor" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                    .filter((staff) => staff.role === "Head Nurse" ||
                                                                                    staff.role === "Nurse Supervisor")
                                                                                    .map((staff) => (_jsxs(SelectItem, { value: staff.id, children: [staff.name, " (", staff.role, ")"] }, staff.id))) })] })] })] })] }), _jsxs(TabsContent, { value: "therapy-assessment", className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium", children: "Therapy Assessment Coordination" }), _jsx(Badge, { variant: "outline", children: assessment.ptAssessmentRequired ||
                                                                    assessment.otAssessmentRequired ||
                                                                    assessment.stAssessmentRequired ||
                                                                    assessment.rtAssessmentRequired
                                                                    ? "Required"
                                                                    : "Not Required" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Coordinate therapy-specific assessments (PT/OT/ST/RT) based on physician orders and clinical needs identified during nursing assessment. Ensure appropriate therapist assignment and scheduling." }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Required Therapy Assessments" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-b pb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "pt-required", checked: assessment.ptAssessmentRequired, onCheckedChange: (checked) => handleToggleRequirement("ptAssessmentRequired", checked === true) }), _jsx(Label, { htmlFor: "pt-required", className: "font-medium", children: "Physical Therapy Assessment" })] }), assessment.ptAssessmentRequired && (_jsx(Badge, { variant: assessment.ptAssessmentCompleted
                                                                                            ? "success"
                                                                                            : "outline", children: assessment.ptAssessmentCompleted
                                                                                            ? "Completed"
                                                                                            : "Pending" }))] }), assessment.ptAssessmentRequired && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "pt-date", children: "Assessment Date" }), _jsx(Input, { id: "pt-date", type: "date", value: assessment.ptAssessmentDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    ptAssessmentDate: e.target.value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "pt-assessor", children: "PT Assessor" }), _jsxs(Select, { value: assessment.ptAssessor || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    ptAssessor: value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })), children: [_jsx(SelectTrigger, { id: "pt-assessor", children: _jsx(SelectValue, { placeholder: "Select therapist" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                                            .filter((staff) => staff.role === "Physical Therapist")
                                                                                                            .map((staff) => (_jsxs(SelectItem, { value: staff.id, children: [staff.name, " ", staff.specialty
                                                                                                                    ? `(${staff.specialty})`
                                                                                                                    : ""] }, staff.id))) })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "pt-completed", checked: assessment.ptAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("ptAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "pt-completed", children: "Assessment Completed" })] }) })] }))] }), _jsxs("div", { className: "border-b pb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ot-required", checked: assessment.otAssessmentRequired, onCheckedChange: (checked) => handleToggleRequirement("otAssessmentRequired", checked === true) }), _jsx(Label, { htmlFor: "ot-required", className: "font-medium", children: "Occupational Therapy Assessment" })] }), assessment.otAssessmentRequired && (_jsx(Badge, { variant: assessment.otAssessmentCompleted
                                                                                            ? "success"
                                                                                            : "outline", children: assessment.otAssessmentCompleted
                                                                                            ? "Completed"
                                                                                            : "Pending" }))] }), assessment.otAssessmentRequired && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ot-date", children: "Assessment Date" }), _jsx(Input, { id: "ot-date", type: "date", value: assessment.otAssessmentDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    otAssessmentDate: e.target.value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "ot-assessor", children: "OT Assessor" }), _jsxs(Select, { value: assessment.otAssessor || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    otAssessor: value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })), children: [_jsx(SelectTrigger, { id: "ot-assessor", children: _jsx(SelectValue, { placeholder: "Select therapist" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                                            .filter((staff) => staff.role === "Occupational Therapist")
                                                                                                            .map((staff) => (_jsx(SelectItem, { value: staff.id, children: staff.name }, staff.id))) })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ot-completed", checked: assessment.otAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("otAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "ot-completed", children: "Assessment Completed" })] }) })] }))] }), _jsxs("div", { className: "border-b pb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "st-required", checked: assessment.stAssessmentRequired, onCheckedChange: (checked) => handleToggleRequirement("stAssessmentRequired", checked === true) }), _jsx(Label, { htmlFor: "st-required", className: "font-medium", children: "Speech Therapy Assessment" })] }), assessment.stAssessmentRequired && (_jsx(Badge, { variant: assessment.stAssessmentCompleted
                                                                                            ? "success"
                                                                                            : "outline", children: assessment.stAssessmentCompleted
                                                                                            ? "Completed"
                                                                                            : "Pending" }))] }), assessment.stAssessmentRequired && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "st-date", children: "Assessment Date" }), _jsx(Input, { id: "st-date", type: "date", value: assessment.stAssessmentDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    stAssessmentDate: e.target.value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "st-assessor", children: "ST Assessor" }), _jsxs(Select, { value: assessment.stAssessor || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    stAssessor: value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })), children: [_jsx(SelectTrigger, { id: "st-assessor", children: _jsx(SelectValue, { placeholder: "Select therapist" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                                            .filter((staff) => staff.role === "Speech Therapist")
                                                                                                            .map((staff) => (_jsx(SelectItem, { value: staff.id, children: staff.name }, staff.id))) })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "st-completed", checked: assessment.stAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("stAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "st-completed", children: "Assessment Completed" })] }) })] }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "rt-required", checked: assessment.rtAssessmentRequired, onCheckedChange: (checked) => handleToggleRequirement("rtAssessmentRequired", checked === true) }), _jsx(Label, { htmlFor: "rt-required", className: "font-medium", children: "Respiratory Therapy Assessment" })] }), assessment.rtAssessmentRequired && (_jsx(Badge, { variant: assessment.rtAssessmentCompleted
                                                                                            ? "success"
                                                                                            : "outline", children: assessment.rtAssessmentCompleted
                                                                                            ? "Completed"
                                                                                            : "Pending" }))] }), assessment.rtAssessmentRequired && (_jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "rt-date", children: "Assessment Date" }), _jsx(Input, { id: "rt-date", type: "date", value: assessment.rtAssessmentDate || "", onChange: (e) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    rtAssessmentDate: e.target.value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "rt-assessor", children: "RT Assessor" }), _jsxs(Select, { value: assessment.rtAssessor || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                                                    ...prev,
                                                                                                    rtAssessor: value,
                                                                                                    updatedAt: new Date().toISOString(),
                                                                                                })), children: [_jsx(SelectTrigger, { id: "rt-assessor", children: _jsx(SelectValue, { placeholder: "Select therapist" }) }), _jsx(SelectContent, { children: availableStaff
                                                                                                            .filter((staff) => staff.role === "Respiratory Therapist")
                                                                                                            .map((staff) => (_jsx(SelectItem, { value: staff.id, children: staff.name }, staff.id))) })] })] }), _jsx("div", { className: "col-span-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "rt-completed", checked: assessment.rtAssessmentCompleted, onCheckedChange: (checked) => handleToggleRequirement("rtAssessmentCompleted", checked === true) }), _jsx(Label, { htmlFor: "rt-completed", children: "Assessment Completed" })] }) })] }))] })] })] })] })] }) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Assessment Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx(Progress, { value: completionPercentage, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: [completionPercentage, "% Complete"] }), _jsxs("span", { children: [100 - completionPercentage, "% Remaining"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [assessment.medicalRecordsCollected ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: "Medical Records Collection" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [assessment.assessmentDate ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: "Home Assessment Scheduling" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [assessment.infectionControlAssessmentCompleted ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: "Infection Control Assessment" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [assessment.nursingAssessmentCompleted ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: "Clinical Assessment" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [(assessment.ptAssessmentRequired &&
                                                                    assessment.ptAssessmentCompleted) ||
                                                                    (assessment.otAssessmentRequired &&
                                                                        assessment.otAssessmentCompleted) ||
                                                                    (assessment.stAssessmentRequired &&
                                                                        assessment.stAssessmentCompleted) ||
                                                                    (assessment.rtAssessmentRequired &&
                                                                        assessment.rtAssessmentCompleted) ? (_jsx(Check, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: "Therapy Assessment" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Assessment Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Assessment Date" }), _jsx("p", { className: "text-sm", children: assessment.assessmentDate
                                                                ? assessment.assessmentDate
                                                                : "Not scheduled" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Assigned Staff" }), assessment.assignedStaff.length > 0 ? (_jsx("div", { className: "text-sm", children: assessment.assignedStaff.map((staff, index) => (_jsxs("div", { children: [staff.name, " (", staff.role, ")", index < assessment.assignedStaff.length - 1 && ", "] }, staff.id))) })) : (_jsx("p", { className: "text-sm text-muted-foreground", children: "No staff assigned" }))] }), assessment.recommendedLevelOfCare && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Recommended Level of Care" }), _jsx("p", { className: "text-sm capitalize", children: assessment.recommendedLevelOfCare.replace(/-/g, " ") })] })), assessment.infectionControlRiskLevel && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Infection Control Risk" }), _jsxs(Badge, { variant: assessment.infectionControlRiskLevel === "High"
                                                                ? "destructive"
                                                                : assessment.infectionControlRiskLevel === "Medium"
                                                                    ? "default"
                                                                    : "outline", children: [assessment.infectionControlRiskLevel, " Risk"] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Required Therapy" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [assessment.ptAssessmentRequired && (_jsx(Badge, { variant: "outline", children: "Physical Therapy" })), assessment.otAssessmentRequired && (_jsx(Badge, { variant: "outline", children: "Occupational Therapy" })), assessment.stAssessmentRequired && (_jsx(Badge, { variant: "outline", children: "Speech Therapy" })), assessment.rtAssessmentRequired && (_jsx(Badge, { variant: "outline", children: "Respiratory Therapy" })), !assessment.ptAssessmentRequired &&
                                                                    !assessment.otAssessmentRequired &&
                                                                    !assessment.stAssessmentRequired &&
                                                                    !assessment.rtAssessmentRequired && (_jsx("p", { className: "text-sm text-muted-foreground", children: "No therapy required" }))] })] }), assessment.recommendedServices &&
                                                    assessment.recommendedServices.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Recommended Services" }), _jsx("div", { className: "flex flex-wrap gap-2", children: assessment.recommendedServices.map((service, index) => (_jsx(Badge, { variant: "outline", children: service }, index))) })] })), assessment.ppeRequirements &&
                                                    assessment.ppeRequirements.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "PPE Requirements" }), _jsx("div", { className: "flex flex-wrap gap-2", children: assessment.ppeRequirements.map((ppe, index) => (_jsx(Badge, { variant: "outline", children: ppe }, index))) })] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Assessment Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-status", children: "Status" }), _jsxs(Select, { value: assessment.assessmentStatus, onValueChange: (value) => setAssessment((prev) => ({
                                                                ...prev,
                                                                assessmentStatus: value,
                                                                updatedAt: new Date().toISOString(),
                                                            })), children: [_jsx(SelectTrigger, { id: "assessment-status", children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Scheduled", children: "Scheduled" }), _jsx(SelectItem, { value: "In Progress", children: "In Progress" }), _jsx(SelectItem, { value: "Completed", children: "Completed" }), _jsx(SelectItem, { value: "Cancelled", children: "Cancelled" })] })] })] }), assessment.assessmentStatus === "Completed" && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessment-outcome", children: "Outcome" }), _jsxs(Select, { value: assessment.assessmentOutcome || "", onValueChange: (value) => setAssessment((prev) => ({
                                                                ...prev,
                                                                assessmentOutcome: value,
                                                                updatedAt: new Date().toISOString(),
                                                            })), children: [_jsx(SelectTrigger, { id: "assessment-outcome", children: _jsx(SelectValue, { placeholder: "Select outcome" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Accepted", children: "Accepted" }), _jsx(SelectItem, { value: "Declined", children: "Declined" }), _jsx(SelectItem, { value: "Referred", children: "Referred" })] })] })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "follow-up-required", checked: assessment.followUpRequired, onCheckedChange: (checked) => handleToggleRequirement("followUpRequired", checked === true) }), _jsx(Label, { htmlFor: "follow-up-required", children: "Follow-up Required" })] }), assessment.followUpRequired && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "follow-up-notes", children: "Follow-up Notes" }), _jsx(Textarea, { id: "follow-up-notes", placeholder: "Enter follow-up notes", value: assessment.followUpNotes || "", onChange: (e) => setAssessment((prev) => ({
                                                                ...prev,
                                                                followUpNotes: e.target.value,
                                                                updatedAt: new Date().toISOString(),
                                                            })) })] }))] }) })] })] })] })] }));
};
export default PatientAssessment;
