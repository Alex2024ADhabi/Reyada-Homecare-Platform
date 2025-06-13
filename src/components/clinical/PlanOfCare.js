import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usePlanOfCare } from "@/hooks/usePlanOfCare";
import { FileText, ClipboardCheck, Users, MessageSquare, Play, Calendar, Clock, CheckCircle, AlertCircle, Save, Upload, UserCheck, Target, Shield, Loader2, RefreshCw, AlertTriangle, } from "lucide-react";
// Using PlanOfCareData from the service instead of defining it here
const PlanOfCare = ({ patientId = "P12345", episodeId = "EP789", isOffline = false, }) => {
    const [activeProcess, setActiveProcess] = useState("initial-development");
    const [planProgress, setPlanProgress] = useState(15);
    const [planId, setPlanId] = useState(undefined);
    // Use the usePlanOfCare hook to manage plan data
    const { plan, plans, isLoading, error, isOnline, fetchPlan, fetchPatientPlans, createPlan, updatePlan, updatePlanStatus, markNursingInputCompleted, markPhysicianReviewCompleted, savePlanOfCare, } = usePlanOfCare({ patientId, planId });
    // Mock data for staff
    const clinicalStaff = [
        { id: "S001", name: "Dr. Khalid Al Mazrouei", role: "Physician" },
        { id: "S002", name: "Dr. Layla Al Shamsi", role: "Nurse Supervisor" },
        { id: "S003", name: "Ahmed Al Mansoori", role: "Physical Therapist" },
        { id: "S004", name: "Fatima Al Zaabi", role: "Occupational Therapist" },
        { id: "S005", name: "Mohammed Al Hashimi", role: "Speech Therapist" },
        { id: "S006", name: "Aisha Al Dhaheri", role: "Respiratory Therapist" },
        { id: "S007", name: "Noura Al Kaabi", role: "Social Worker" },
    ];
    // Local state for the plan of care
    const [planOfCare, setPlanOfCare] = useState({
        patientId: patientId,
        planType: "Initial",
        planVersion: 1,
        effectiveDate: "",
        reviewDate: "",
        expirationDate: "",
        developmentInitiatedDate: new Date().toISOString().split("T")[0],
        developmentInitiatedBy: "S002",
        nursingInputCompleted: false,
        ptInputRequired: false,
        ptInputCompleted: false,
        otInputRequired: false,
        otInputCompleted: false,
        stInputRequired: false,
        stInputCompleted: false,
        rtInputRequired: false,
        rtInputCompleted: false,
        socialWorkInputRequired: false,
        socialWorkInputCompleted: false,
        submittedForPhysicianReview: false,
        physicianReviewCompleted: false,
        prescriptionOrdersCompleted: false,
        treatmentOrdersCompleted: false,
        diagnosticOrdersCompleted: false,
        familyEducationScheduled: false,
        familyEducationCompleted: false,
        familyConsentObtained: false,
        familyQuestionsAddressed: false,
        staffCommunicationCompleted: false,
        staffTrainingRequired: false,
        staffTrainingCompleted: false,
        communicationProtocolsEstablished: false,
        implementationStarted: false,
        monitoringProtocolsActive: false,
        planStatus: "Developing",
    });
    // Load existing plan or fetch patient plans on component mount
    useEffect(() => {
        if (planId) {
            fetchPlan(planId);
        }
        else if (patientId) {
            fetchPatientPlans(patientId);
        }
    }, [planId, patientId, fetchPlan, fetchPatientPlans]);
    // Update local state when plan data is loaded
    useEffect(() => {
        if (plan) {
            setPlanOfCare(plan);
            setPlanProgress(calculateCompletionPercentage(plan));
        }
    }, [plan]);
    const calculateCompletionPercentage = (plan) => {
        let totalFields = 0;
        let completedFields = 0;
        // Process 1: Initial Plan Development
        if (plan.nursingInputCompleted)
            completedFields++;
        totalFields++;
        if (plan.ptInputRequired) {
            totalFields++;
            if (plan.ptInputCompleted)
                completedFields++;
        }
        if (plan.otInputRequired) {
            totalFields++;
            if (plan.otInputCompleted)
                completedFields++;
        }
        if (plan.stInputRequired) {
            totalFields++;
            if (plan.stInputCompleted)
                completedFields++;
        }
        if (plan.rtInputRequired) {
            totalFields++;
            if (plan.rtInputCompleted)
                completedFields++;
        }
        if (plan.socialWorkInputRequired) {
            totalFields++;
            if (plan.socialWorkInputCompleted)
                completedFields++;
        }
        // Process 2: Physician Review and Approval
        if (plan.submittedForPhysicianReview)
            completedFields++;
        totalFields++;
        if (plan.physicianReviewCompleted)
            completedFields++;
        totalFields++;
        if (plan.prescriptionOrdersCompleted)
            completedFields++;
        if (plan.treatmentOrdersCompleted)
            completedFields++;
        if (plan.diagnosticOrdersCompleted)
            completedFields++;
        totalFields += 3;
        // Process 3: Family Education and Consent
        if (plan.familyEducationScheduled)
            completedFields++;
        totalFields++;
        if (plan.familyEducationCompleted)
            completedFields++;
        totalFields++;
        if (plan.familyConsentObtained)
            completedFields++;
        totalFields++;
        if (plan.familyQuestionsAddressed)
            completedFields++;
        totalFields++;
        // Process 4: Staff Communication and Training
        if (plan.staffCommunicationCompleted)
            completedFields++;
        totalFields++;
        if (plan.staffTrainingRequired) {
            totalFields++;
            if (plan.staffTrainingCompleted)
                completedFields++;
        }
        if (plan.communicationProtocolsEstablished)
            completedFields++;
        totalFields++;
        // Process 5: Implementation and Monitoring
        if (plan.implementationStarted)
            completedFields++;
        totalFields++;
        if (plan.monitoringProtocolsActive)
            completedFields++;
        totalFields++;
        // Goals, resources, and other fields
        if (plan.shortTermGoals)
            completedFields++;
        if (plan.longTermGoals)
            completedFields++;
        if (plan.measurableOutcomes)
            completedFields++;
        if (plan.goalTargetDates)
            completedFields++;
        totalFields += 4;
        if (plan.equipmentRequirements)
            completedFields++;
        if (plan.supplyRequirements)
            completedFields++;
        if (plan.staffingRequirements)
            completedFields++;
        if (plan.familyCaregiverRequirements)
            completedFields++;
        totalFields += 4;
        if (plan.safetyConsiderations)
            completedFields++;
        if (plan.riskMitigationStrategies)
            completedFields++;
        if (plan.qualityIndicators)
            completedFields++;
        totalFields += 3;
        return Math.round((completedFields / totalFields) * 100);
    };
    const handleSave = async () => {
        try {
            // Save the plan of care using the hook
            const savedPlan = await savePlanOfCare(planOfCare);
            if (savedPlan) {
                // If this is a new plan, update the planId
                if (savedPlan.id && !planId) {
                    setPlanId(savedPlan.id);
                }
                // Update the progress
                setPlanProgress(calculateCompletionPercentage(savedPlan));
                if (!isOnline) {
                    alert("Plan of Care saved locally. Will sync when online connection is restored.");
                }
                else {
                    alert("Plan of Care saved successfully.");
                }
            }
        }
        catch (err) {
            console.error("Error saving plan of care:", err);
            alert("Failed to save Plan of Care. Please try again.");
        }
    };
    const handleToggleField = (field, value) => {
        setPlanOfCare((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const handlePlanStatusChange = async (status) => {
        // Update local state
        setPlanOfCare((prev) => ({
            ...prev,
            planStatus: status,
        }));
        // If we have a plan ID, update the status through the service
        if (planId) {
            try {
                const updatedPlan = await updatePlanStatus(planId, status);
                if (updatedPlan) {
                    setPlanProgress(calculateCompletionPercentage(updatedPlan));
                }
            }
            catch (err) {
                console.error("Error updating plan status:", err);
            }
        }
        else {
            // For new plans, just update the progress locally
            setPlanProgress(calculateCompletionPercentage({
                ...planOfCare,
                planStatus: status,
            }));
        }
    };
    // Handle marking nursing input as completed
    const handleMarkNursingInputCompleted = async () => {
        if (planId) {
            try {
                const updatedPlan = await markNursingInputCompleted(planId, planOfCare.developmentInitiatedBy);
                if (updatedPlan) {
                    setPlanOfCare(updatedPlan);
                    setPlanProgress(calculateCompletionPercentage(updatedPlan));
                }
            }
            catch (err) {
                console.error("Error marking nursing input as completed:", err);
            }
        }
        else {
            // For new plans, just update the local state
            handleToggleField("nursingInputCompleted", true);
            handleToggleField("nursingInputDate", new Date().toISOString());
            handleToggleField("nursingInputBy", planOfCare.developmentInitiatedBy);
        }
    };
    // Handle marking physician review as completed
    const handleMarkPhysicianReviewCompleted = async (physicianId, approvalStatus, comments) => {
        if (planId) {
            try {
                const updatedPlan = await markPhysicianReviewCompleted(planId, physicianId, approvalStatus, comments);
                if (updatedPlan) {
                    setPlanOfCare(updatedPlan);
                    setPlanProgress(calculateCompletionPercentage(updatedPlan));
                }
            }
            catch (err) {
                console.error("Error marking physician review as completed:", err);
            }
        }
        else {
            // For new plans, just update the local state
            handleToggleField("physicianReviewCompleted", true);
            handleToggleField("physicianReviewDate", new Date().toISOString());
            handleToggleField("physicianReviewer", physicianId);
            handleToggleField("physicianApprovalStatus", approvalStatus);
            if (comments)
                handleToggleField("physicianComments", comments);
        }
    };
    // Show loading state
    if (isLoading) {
        return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6 flex flex-col items-center justify-center", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin text-primary mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "Loading Plan of Care..." })] }));
    }
    // Show error state
    if (error) {
        return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6 flex flex-col items-center justify-center", children: [_jsx(AlertTriangle, { className: "h-12 w-12 text-destructive mb-4" }), _jsx("p", { className: "text-lg font-medium mb-2", children: "Error Loading Plan of Care" }), _jsx("p", { className: "text-muted-foreground mb-4", children: error }), _jsxs(Button, { onClick: () => planId ? fetchPlan(planId) : fetchPatientPlans(patientId), children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), " Retry"] })] }));
    }
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Plan of Care" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs(Badge, { variant: "outline", children: ["Episode: ", episodeId] }), _jsxs(Badge, { variant: "outline", children: ["Patient ID: ", patientId] }), _jsxs(Badge, { variant: "outline", children: ["Version: ", planOfCare.planVersion] }), _jsx(Badge, { className: `${planOfCare.planStatus === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : planOfCare.planStatus === "Approved"
                                                ? "bg-blue-100 text-blue-800"
                                                : planOfCare.planStatus === "Under Review"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-gray-100 text-gray-800"}`, children: planOfCare.planStatus })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: planOfCare.planStatus, onValueChange: (value) => handlePlanStatusChange(value), children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Plan Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Developing", children: "Developing" }), _jsx(SelectItem, { value: "Under Review", children: "Under Review" }), _jsx(SelectItem, { value: "Approved", children: "Approved" }), _jsx(SelectItem, { value: "Active", children: "Active" }), _jsx(SelectItem, { value: "Revised", children: "Revised" }), _jsx(SelectItem, { value: "Discontinued", children: "Discontinued" })] })] }), _jsx(Badge, { variant: !isOnline ? "destructive" : "secondary", className: "text-xs", children: !isOnline ? "Offline Mode" : "Online" })] })] }), _jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Plan of Care Completion" }), _jsxs("span", { className: "text-sm font-medium", children: [planProgress, "%"] })] }), _jsx(Progress, { value: planProgress, className: "h-2" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground mt-2", children: [_jsxs("div", { className: `flex items-center gap-1 ${planProgress >= 20 ? "text-green-600" : ""}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${planProgress >= 20 ? "bg-green-600" : "bg-gray-300"}` }), _jsx("span", { children: "Development" })] }), _jsxs("div", { className: `flex items-center gap-1 ${planProgress >= 40 ? "text-green-600" : ""}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${planProgress >= 40 ? "bg-green-600" : "bg-gray-300"}` }), _jsx("span", { children: "Physician Review" })] }), _jsxs("div", { className: `flex items-center gap-1 ${planProgress >= 60 ? "text-green-600" : ""}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${planProgress >= 60 ? "bg-green-600" : "bg-gray-300"}` }), _jsx("span", { children: "Family Consent" })] }), _jsxs("div", { className: `flex items-center gap-1 ${planProgress >= 80 ? "text-green-600" : ""}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${planProgress >= 80 ? "bg-green-600" : "bg-gray-300"}` }), _jsx("span", { children: "Staff Training" })] }), _jsxs("div", { className: `flex items-center gap-1 ${planProgress >= 100 ? "text-green-600" : ""}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${planProgress >= 100 ? "bg-green-600" : "bg-gray-300"}` }), _jsx("span", { children: "Implementation" })] })] })] }) }) }), _jsxs(Tabs, { value: activeProcess, onValueChange: setActiveProcess, className: "mb-6", children: [_jsxs(TabsList, { className: "grid grid-cols-2 md:grid-cols-5 mb-6", children: [_jsxs(TabsTrigger, { value: "initial-development", children: [_jsx(FileText, { className: "h-4 w-4 mr-2 hidden md:inline" }), _jsx("span", { className: "truncate", children: "Initial Development" })] }), _jsxs(TabsTrigger, { value: "physician-review", children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2 hidden md:inline" }), _jsx("span", { className: "truncate", children: "Physician Review" })] }), _jsxs(TabsTrigger, { value: "family-education", children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-2 hidden md:inline" }), _jsx("span", { className: "truncate", children: "Family Education" })] }), _jsxs(TabsTrigger, { value: "staff-communication", children: [_jsx(Users, { className: "h-4 w-4 mr-2 hidden md:inline" }), _jsx("span", { className: "truncate", children: "Staff Communication" })] }), _jsxs(TabsTrigger, { value: "implementation", children: [_jsx(Play, { className: "h-4 w-4 mr-2 hidden md:inline" }), _jsx("span", { className: "truncate", children: "Implementation" })] })] }), _jsx(TabsContent, { value: "initial-development", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-5 w-5" }), "Initial Plan Development"] }), _jsx(CardDescription, { children: "Develop comprehensive initial plan of care based on assessment findings, physician orders, and patient/family goals. Coordinate input from all relevant disciplines including nursing, therapy services, and social services." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "plan-type", children: "Plan Type" }), _jsxs(Select, { value: planOfCare.planType, onValueChange: (value) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                planType: value,
                                                                                updatedAt: new Date().toISOString(),
                                                                            })), children: [_jsx(SelectTrigger, { id: "plan-type", children: _jsx(SelectValue, { placeholder: "Select plan type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Initial", children: "Initial" }), _jsx(SelectItem, { value: "Revised", children: "Revised" }), _jsx(SelectItem, { value: "Updated", children: "Updated" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "plan-version", children: "Version" }), _jsx(Input, { id: "plan-version", type: "number", value: planOfCare.planVersion, onChange: (e) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                planVersion: parseInt(e.target.value),
                                                                                updatedAt: new Date().toISOString(),
                                                                            })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "effective-date", children: "Effective Date" }), _jsx(Input, { id: "effective-date", type: "date", value: planOfCare.effectiveDate, onChange: (e) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                effectiveDate: e.target.value,
                                                                                updatedAt: new Date().toISOString(),
                                                                            })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "review-date", children: "Review Date" }), _jsx(Input, { id: "review-date", type: "date", value: planOfCare.reviewDate, onChange: (e) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                reviewDate: e.target.value,
                                                                                updatedAt: new Date().toISOString(),
                                                                            })) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "expiration-date", children: "Expiration Date" }), _jsx(Input, { id: "expiration-date", type: "date", value: planOfCare.expirationDate, onChange: (e) => setPlanOfCare((prev) => ({
                                                                        ...prev,
                                                                        expirationDate: e.target.value,
                                                                        updatedAt: new Date().toISOString(),
                                                                    })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "initiated-date", children: "Development Initiated Date" }), _jsx(Input, { id: "initiated-date", type: "date", value: planOfCare.developmentInitiatedDate, onChange: (e) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                developmentInitiatedDate: e.target.value,
                                                                                updatedAt: new Date().toISOString(),
                                                                            })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "initiated-by", children: "Initiated By" }), _jsxs(Select, { value: planOfCare.developmentInitiatedBy, onValueChange: (value) => setPlanOfCare((prev) => ({
                                                                                ...prev,
                                                                                developmentInitiatedBy: value,
                                                                                updatedAt: new Date().toISOString(),
                                                                            })), children: [_jsx(SelectTrigger, { id: "initiated-by", children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsx(SelectContent, { children: clinicalStaff.map((staff) => (_jsxs(SelectItem, { value: staff.id, children: [staff.name, " (", staff.role, ")"] }, staff.id))) })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Multi-Disciplinary Input" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "nursing-input", checked: planOfCare.nursingInputCompleted, onCheckedChange: (checked) => {
                                                                                                if (checked === true) {
                                                                                                    handleMarkNursingInputCompleted();
                                                                                                }
                                                                                                else {
                                                                                                    handleToggleField("nursingInputCompleted", false);
                                                                                                }
                                                                                            } }), _jsx(Label, { htmlFor: "nursing-input", children: "Nursing Input" })] }), planOfCare.nursingInputCompleted && (_jsx(Badge, { variant: "outline", className: "ml-2", children: "Completed" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "pt-required", checked: planOfCare.ptInputRequired, onCheckedChange: (checked) => handleToggleField("ptInputRequired", checked === true) }), _jsx(Label, { htmlFor: "pt-required", children: "Physical Therapy Input" })] }), planOfCare.ptInputRequired && (_jsx(Badge, { variant: planOfCare.ptInputCompleted
                                                                                        ? "outline"
                                                                                        : "secondary", className: "ml-2", children: planOfCare.ptInputCompleted
                                                                                        ? "Completed"
                                                                                        : "Required" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "ot-required", checked: planOfCare.otInputRequired, onCheckedChange: (checked) => handleToggleField("otInputRequired", checked === true) }), _jsx(Label, { htmlFor: "ot-required", children: "Occupational Therapy Input" })] }), planOfCare.otInputRequired && (_jsx(Badge, { variant: planOfCare.otInputCompleted
                                                                                        ? "outline"
                                                                                        : "secondary", className: "ml-2", children: planOfCare.otInputCompleted
                                                                                        ? "Completed"
                                                                                        : "Required" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "st-required", checked: planOfCare.stInputRequired, onCheckedChange: (checked) => handleToggleField("stInputRequired", checked === true) }), _jsx(Label, { htmlFor: "st-required", children: "Speech Therapy Input" })] }), planOfCare.stInputRequired && (_jsx(Badge, { variant: planOfCare.stInputCompleted
                                                                                        ? "outline"
                                                                                        : "secondary", className: "ml-2", children: planOfCare.stInputCompleted
                                                                                        ? "Completed"
                                                                                        : "Required" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "rt-required", checked: planOfCare.rtInputRequired, onCheckedChange: (checked) => handleToggleField("rtInputRequired", checked === true) }), _jsx(Label, { htmlFor: "rt-required", children: "Respiratory Therapy Input" })] }), planOfCare.rtInputRequired && (_jsx(Badge, { variant: planOfCare.rtInputCompleted
                                                                                        ? "outline"
                                                                                        : "secondary", className: "ml-2", children: planOfCare.rtInputCompleted
                                                                                        ? "Completed"
                                                                                        : "Required" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "social-work-required", checked: planOfCare.socialWorkInputRequired, onCheckedChange: (checked) => handleToggleField("socialWorkInputRequired", checked === true) }), _jsx(Label, { htmlFor: "social-work-required", children: "Social Work Input" })] }), planOfCare.socialWorkInputRequired && (_jsx(Badge, { variant: planOfCare.socialWorkInputCompleted
                                                                                        ? "outline"
                                                                                        : "secondary", className: "ml-2", children: planOfCare.socialWorkInputCompleted
                                                                                        ? "Completed"
                                                                                        : "Required" }))] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "short-term-goals", children: "Short-Term Goals" }), _jsx(Textarea, { id: "short-term-goals", placeholder: "Enter short-term goals", value: planOfCare.shortTermGoals || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                        ...prev,
                                                                        shortTermGoals: e.target.value,
                                                                        updatedAt: new Date().toISOString(),
                                                                    })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "long-term-goals", children: "Long-Term Goals" }), _jsx(Textarea, { id: "long-term-goals", placeholder: "Enter long-term goals", value: planOfCare.longTermGoals || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                        ...prev,
                                                                        longTermGoals: e.target.value,
                                                                        updatedAt: new Date().toISOString(),
                                                                    })) })] })] })] }), _jsx(Separator, { className: "my-6" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Measurable Outcomes" }), _jsx(Textarea, { id: "measurable-outcomes", placeholder: "Enter measurable outcomes", value: planOfCare.measurableOutcomes || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                ...prev,
                                                                measurableOutcomes: e.target.value,
                                                                updatedAt: new Date().toISOString(),
                                                            })) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Goal Target Dates" }), _jsx(Textarea, { id: "goal-target-dates", placeholder: "Enter goal target dates", value: planOfCare.goalTargetDates || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                ...prev,
                                                                goalTargetDates: e.target.value,
                                                                updatedAt: new Date().toISOString(),
                                                            })) })] })] })] }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", children: "Reset" }), _jsx(Button, { onClick: handleSave, children: "Save & Continue" })] })] }) }), _jsx(TabsContent, { value: "physician-review", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ClipboardCheck, { className: "h-5 w-5" }), "Physician Review and Approval"] }), _jsx(CardDescription, { children: "Submit completed plan of care to attending physician for medical review, approval, and prescription orders. Ensure all medical interventions are properly ordered and documented." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "submitted-for-review", checked: planOfCare.submittedForPhysicianReview, onCheckedChange: (checked) => handleToggleField("submittedForPhysicianReview", checked === true) }), _jsx(Label, { htmlFor: "submitted-for-review", className: "font-medium", children: "Submitted for Physician Review" })] }), planOfCare.submittedForPhysicianReview && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "submission-date", children: "Submission Date" }), _jsx(Input, { id: "submission-date", type: "date", value: planOfCare.submissionDate || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                                    ...prev,
                                                                                    submissionDate: e.target.value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "physician-reviewer", children: "Physician Reviewer" }), _jsxs(Select, { value: planOfCare.physicianReviewer || "", onValueChange: (value) => setPlanOfCare((prev) => ({
                                                                                    ...prev,
                                                                                    physicianReviewer: value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })), children: [_jsx(SelectTrigger, { id: "physician-reviewer", children: _jsx(SelectValue, { placeholder: "Select physician" }) }), _jsx(SelectContent, { children: clinicalStaff
                                                                                            .filter((staff) => staff.role === "Physician")
                                                                                            .map((staff) => (_jsx(SelectItem, { value: staff.id, children: staff.name }, staff.id))) })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "physician-review-completed", checked: planOfCare.physicianReviewCompleted, onCheckedChange: (checked) => {
                                                                            if (checked === true &&
                                                                                planOfCare.physicianReviewer) {
                                                                                handleMarkPhysicianReviewCompleted(planOfCare.physicianReviewer, planOfCare.physicianApprovalStatus ||
                                                                                    "Approved");
                                                                            }
                                                                            else {
                                                                                handleToggleField("physicianReviewCompleted", checked === true);
                                                                            }
                                                                        } }), _jsx(Label, { htmlFor: "physician-review-completed", className: "font-medium", children: "Physician Review Completed" })] }), planOfCare.physicianReviewCompleted && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "physician-review-date", children: "Review Date" }), _jsx(Input, { id: "physician-review-date", type: "date", value: planOfCare.physicianReviewDate || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                                            ...prev,
                                                                                            physicianReviewDate: e.target.value,
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "approval-status", children: "Approval Status" }), _jsxs(Select, { value: planOfCare.physicianApprovalStatus || "", onValueChange: (value) => setPlanOfCare((prev) => ({
                                                                                            ...prev,
                                                                                            physicianApprovalStatus: value,
                                                                                            updatedAt: new Date().toISOString(),
                                                                                        })), children: [_jsx(SelectTrigger, { id: "approval-status", children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Approved", children: "Approved" }), _jsx(SelectItem, { value: "Modifications Required", children: "Modifications Required" }), _jsx(SelectItem, { value: "Rejected", children: "Rejected" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "physician-comments", children: "Physician Comments" }), _jsx(Textarea, { id: "physician-comments", placeholder: "Enter physician comments", value: planOfCare.physicianComments || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                                    ...prev,
                                                                                    physicianComments: e.target.value,
                                                                                    updatedAt: new Date().toISOString(),
                                                                                })) })] })] }))] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Medical Orders" }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "prescription-orders", checked: planOfCare.prescriptionOrdersCompleted, onCheckedChange: (checked) => handleToggleField("prescriptionOrdersCompleted", checked === true) }), _jsx(Label, { htmlFor: "prescription-orders", children: "Prescription Orders Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "treatment-orders", checked: planOfCare.treatmentOrdersCompleted, onCheckedChange: (checked) => handleToggleField("treatmentOrdersCompleted", checked === true) }), _jsx(Label, { htmlFor: "treatment-orders", children: "Treatment Orders Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "diagnostic-orders", checked: planOfCare.diagnosticOrdersCompleted, onCheckedChange: (checked) => handleToggleField("diagnosticOrdersCompleted", checked === true) }), _jsx(Label, { htmlFor: "diagnostic-orders", children: "Diagnostic Orders Completed" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "safety-considerations", children: "Safety Considerations" }), _jsx(Textarea, { id: "safety-considerations", placeholder: "Enter safety considerations", value: planOfCare.safetyConsiderations || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    safetyConsiderations: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "risk-mitigation", children: "Risk Mitigation Strategies" }), _jsx(Textarea, { id: "risk-mitigation", placeholder: "Enter risk mitigation strategies", value: planOfCare.riskMitigationStrategies || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    riskMitigationStrategies: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", children: "Reset" }), _jsx(Button, { onClick: handleSave, children: "Save & Continue" })] })] }) }), _jsx(TabsContent, { value: "family-education", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-5 w-5" }), "Family Education and Consent"] }), _jsx(CardDescription, { children: "Conduct comprehensive family education regarding plan of care, obtain informed consent, and establish family participation expectations and responsibilities." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "family-education-scheduled", checked: planOfCare.familyEducationScheduled, onCheckedChange: (checked) => handleToggleField("familyEducationScheduled", checked === true) }), _jsx(Label, { htmlFor: "family-education-scheduled", className: "font-medium", children: "Family Education Session Scheduled" })] }), planOfCare.familyEducationScheduled && (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "family-education-date", children: "Education Date" }), _jsx(Input, { id: "family-education-date", type: "date", value: planOfCare.familyEducationDate || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                            ...prev,
                                                                            familyEducationDate: e.target.value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "family-education-by", children: "Conducted By" }), _jsxs(Select, { value: planOfCare.familyEducationBy || "", onValueChange: (value) => setPlanOfCare((prev) => ({
                                                                            ...prev,
                                                                            familyEducationBy: value,
                                                                            updatedAt: new Date().toISOString(),
                                                                        })), children: [_jsx(SelectTrigger, { id: "family-education-by", children: _jsx(SelectValue, { placeholder: "Select staff member" }) }), _jsx(SelectContent, { children: clinicalStaff.map((staff) => (_jsxs(SelectItem, { value: staff.id, children: [staff.name, " (", staff.role, ")"] }, staff.id))) })] })] })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "family-education-completed", checked: planOfCare.familyEducationCompleted, onCheckedChange: (checked) => handleToggleField("familyEducationCompleted", checked === true) }), _jsx(Label, { htmlFor: "family-education-completed", className: "font-medium", children: "Family Education Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "family-consent-obtained", checked: planOfCare.familyConsentObtained, onCheckedChange: (checked) => handleToggleField("familyConsentObtained", checked === true) }), _jsx(Label, { htmlFor: "family-consent-obtained", className: "font-medium", children: "Family Consent Obtained" })] }), planOfCare.familyConsentObtained && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "family-consent-date", children: "Consent Date" }), _jsx(Input, { id: "family-consent-date", type: "date", value: planOfCare.familyConsentDate || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    familyConsentDate: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "family-questions-addressed", checked: planOfCare.familyQuestionsAddressed, onCheckedChange: (checked) => handleToggleField("familyQuestionsAddressed", checked === true) }), _jsx(Label, { htmlFor: "family-questions-addressed", className: "font-medium", children: "Family Questions Addressed" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "family-caregiver-requirements", children: "Family/Caregiver Requirements" }), _jsx(Textarea, { id: "family-caregiver-requirements", placeholder: "Enter family/caregiver requirements", value: planOfCare.familyCaregiverRequirements || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    familyCaregiverRequirements: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Education Topics Covered" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-care-plan" }), _jsx(Label, { htmlFor: "topic-care-plan", className: "text-sm", children: "Care Plan Overview" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-medication" }), _jsx(Label, { htmlFor: "topic-medication", className: "text-sm", children: "Medication Management" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-equipment" }), _jsx(Label, { htmlFor: "topic-equipment", className: "text-sm", children: "Equipment Usage" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-emergency" }), _jsx(Label, { htmlFor: "topic-emergency", className: "text-sm", children: "Emergency Procedures" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-responsibilities" }), _jsx(Label, { htmlFor: "topic-responsibilities", className: "text-sm", children: "Family Responsibilities" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "topic-communication" }), _jsx(Label, { htmlFor: "topic-communication", className: "text-sm", children: "Communication Protocols" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "education-notes", children: "Education Session Notes" }), _jsx(Textarea, { id: "education-notes", placeholder: "Enter education session notes" })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", children: "Reset" }), _jsx(Button, { onClick: handleSave, children: "Save & Continue" })] })] }) }), _jsx(TabsContent, { value: "staff-communication", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "Staff Communication and Training"] }), _jsx(CardDescription, { children: "Disseminate approved plan of care to all involved staff members, provide necessary training on specific interventions, and establish monitoring and communication protocols." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "staff-communication-completed", checked: planOfCare.staffCommunicationCompleted, onCheckedChange: (checked) => handleToggleField("staffCommunicationCompleted", checked === true) }), _jsx(Label, { htmlFor: "staff-communication-completed", className: "font-medium", children: "Staff Communication Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "staff-training-required", checked: planOfCare.staffTrainingRequired, onCheckedChange: (checked) => handleToggleField("staffTrainingRequired", checked === true) }), _jsx(Label, { htmlFor: "staff-training-required", className: "font-medium", children: "Staff Training Required" })] }), planOfCare.staffTrainingRequired && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "staff-training-completed", checked: planOfCare.staffTrainingCompleted, onCheckedChange: (checked) => handleToggleField("staffTrainingCompleted", checked === true) }), _jsx(Label, { htmlFor: "staff-training-completed", className: "font-medium", children: "Staff Training Completed" })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "communication-protocols-established", checked: planOfCare.communicationProtocolsEstablished, onCheckedChange: (checked) => handleToggleField("communicationProtocolsEstablished", checked === true) }), _jsx(Label, { htmlFor: "communication-protocols-established", className: "font-medium", children: "Communication Protocols Established" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "staffing-requirements", children: "Staffing Requirements" }), _jsx(Textarea, { id: "staffing-requirements", placeholder: "Enter staffing requirements", value: planOfCare.staffingRequirements || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    staffingRequirements: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Staff Assignment" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "assign-primary-nurse", defaultChecked: true }), _jsx(Label, { htmlFor: "assign-primary-nurse", className: "text-sm", children: "Primary Nurse Assigned" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "assign-backup-nurse", defaultChecked: true }), _jsx(Label, { htmlFor: "assign-backup-nurse", className: "text-sm", children: "Backup Nurse Assigned" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "assign-therapists" }), _jsx(Label, { htmlFor: "assign-therapists", className: "text-sm", children: "Therapists Assigned" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "assign-social-worker" }), _jsx(Label, { htmlFor: "assign-social-worker", className: "text-sm", children: "Social Worker Assigned" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "quality-indicators", children: "Quality Indicators" }), _jsx(Textarea, { id: "quality-indicators", placeholder: "Enter quality indicators", value: planOfCare.qualityIndicators || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    qualityIndicators: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "communication-notes", children: "Communication Notes" }), _jsx(Textarea, { id: "communication-notes", placeholder: "Enter communication notes" })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", children: "Reset" }), _jsx(Button, { onClick: handleSave, children: "Save & Continue" })] })] }) }), _jsx(TabsContent, { value: "implementation", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Play, { className: "h-5 w-5" }), "Implementation and Monitoring"] }), _jsx(CardDescription, { children: "Implement approved plan of care with continuous monitoring, regular review, and modification as needed based on patient response and changing needs." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "implementation-started", checked: planOfCare.implementationStarted, onCheckedChange: (checked) => handleToggleField("implementationStarted", checked === true) }), _jsx(Label, { htmlFor: "implementation-started", className: "font-medium", children: "Implementation Started" })] }), planOfCare.implementationStarted && (_jsxs("div", { children: [_jsx(Label, { htmlFor: "implementation-start-date", children: "Implementation Start Date" }), _jsx(Input, { id: "implementation-start-date", type: "date", value: planOfCare.implementationStartDate || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    implementationStartDate: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] })), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "monitoring-protocols-active", checked: planOfCare.monitoringProtocolsActive, onCheckedChange: (checked) => handleToggleField("monitoringProtocolsActive", checked === true) }), _jsx(Label, { htmlFor: "monitoring-protocols-active", className: "font-medium", children: "Monitoring Protocols Active" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "equipment-requirements", children: "Equipment Requirements" }), _jsx(Textarea, { id: "equipment-requirements", placeholder: "Enter equipment requirements", value: planOfCare.equipmentRequirements || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    equipmentRequirements: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "supply-requirements", children: "Supply Requirements" }), _jsx(Textarea, { id: "supply-requirements", placeholder: "Enter supply requirements", value: planOfCare.supplyRequirements || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    supplyRequirements: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Monitoring Schedule" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "daily-monitoring", defaultChecked: true }), _jsx(Label, { htmlFor: "daily-monitoring", className: "text-sm", children: "Daily Monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "weekly-review", defaultChecked: true }), _jsx(Label, { htmlFor: "weekly-review", className: "text-sm", children: "Weekly Progress Review" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "monthly-assessment" }), _jsx(Label, { htmlFor: "monthly-assessment", className: "text-sm", children: "Monthly Comprehensive Assessment" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "quarterly-plan-update" }), _jsx(Label, { htmlFor: "quarterly-plan-update", className: "text-sm", children: "Quarterly Plan Update" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status-notes", children: "Status Notes" }), _jsx(Textarea, { id: "status-notes", placeholder: "Enter status notes", value: planOfCare.statusNotes || "", onChange: (e) => setPlanOfCare((prev) => ({
                                                                    ...prev,
                                                                    statusNotes: e.target.value,
                                                                    updatedAt: new Date().toISOString(),
                                                                })) })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Implementation Checklist" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "initial-visit" }), _jsx(Label, { htmlFor: "initial-visit", className: "text-sm", children: "Initial Visit Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "baseline-established" }), _jsx(Label, { htmlFor: "baseline-established", className: "text-sm", children: "Baseline Measurements Established" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "documentation-system" }), _jsx(Label, { htmlFor: "documentation-system", className: "text-sm", children: "Documentation System Setup" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "emergency-protocols" }), _jsx(Label, { htmlFor: "emergency-protocols", className: "text-sm", children: "Emergency Protocols Tested" })] })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", children: "Reset" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: handleSave, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), " Save Draft"] }), _jsxs(Button, { onClick: async () => {
                                                        await handlePlanStatusChange("Active");
                                                        await handleSave();
                                                    }, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), " Activate Plan"] })] })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(UserCheck, { className: "h-4 w-4" }), " Multi-Disciplinary Input"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Nursing" }), planOfCare.nursingInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), planOfCare.ptInputRequired && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Physical Therapy" }), planOfCare.ptInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })), planOfCare.otInputRequired && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Occupational Therapy" }), planOfCare.otInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })), planOfCare.stInputRequired && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Speech Therapy" }), planOfCare.stInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })), planOfCare.rtInputRequired && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Respiratory Therapy" }), planOfCare.rtInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })), planOfCare.socialWorkInputRequired && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Social Work" }), planOfCare.socialWorkInputCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Target, { className: "h-4 w-4" }), " Goals & Timeline"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: ["Effective: ", planOfCare.effectiveDate || "Not set"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: ["Review: ", planOfCare.reviewDate || "Not set"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: ["Expiration: ", planOfCare.expirationDate || "Not set"] })] }), _jsx(Separator, { className: "my-2" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Short-term Goals:" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: planOfCare.shortTermGoals
                                                        ? planOfCare.shortTermGoals.substring(0, 100) + "..."
                                                        : "Not defined" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), " Approvals & Safety"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Physician Review" }), planOfCare.physicianReviewCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Family Consent" }), planOfCare.familyConsentObtained ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Staff Training" }), planOfCare.staffTrainingRequired ? (planOfCare.staffTrainingCompleted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))) : (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Not Required" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Implementation" }), planOfCare.implementationStarted ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })] }) })] })] })] }));
};
export default PlanOfCare;
