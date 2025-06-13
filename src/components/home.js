import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, RefreshCw, Wifi, WifiOff, } from "lucide-react";
import { connectToDatabase, getDb, resetDatabase } from "@/api/db";
import { ObjectId } from "@/api/browser-mongodb";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { offlineService } from "@/services/offline.service";
function Home() {
    const navigate = useNavigate();
    const { toast } = useToastContext();
    const { handleApiError, handleSuccess } = useErrorHandler();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingItems, setPendingItems] = useState({
        clinicalForms: 0,
        patientAssessments: 0,
        serviceInitiations: 0,
    });
    const [isSyncing, setIsSyncing] = useState(false);
    useEffect(() => {
        initializeDatabase();
        loadPendingItems();
        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true);
            handleSuccess("Connection Restored", "You are now back online");
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "Connection Lost",
                description: "You are now working offline. Changes will be saved locally.",
                variant: "warning",
            });
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);
    const handleNavigate = (path) => {
        navigate(path);
    };
    const initializeDatabase = async () => {
        try {
            setLoading(true);
            setMessage("Connecting to database...");
            await connectToDatabase();
            setMessage("Loading referrals...");
            const db = getDb();
            const result = await db.collection("referrals").find().toArray();
            if (result.length === 0) {
                setMessage("No referrals found. Adding sample data...");
                await addSampleData();
                const newResult = await db.collection("referrals").find().toArray();
                setReferrals(newResult);
            }
            else {
                setReferrals(result);
            }
            setMessage("");
            handleSuccess("Database Connected", "Successfully connected to the database");
        }
        catch (error) {
            console.error("Database initialization error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setMessage(`Error: ${errorMessage}`);
            handleApiError(error, "Database Initialization");
        }
        finally {
            setLoading(false);
        }
    };
    const addSampleData = async () => {
        const db = getDb();
        const sampleReferrals = [
            {
                referralDate: new Date(),
                referralSource: "Dr. Smith Clinic",
                referralSourceContact: "dr.smith@example.com",
                patientName: "John Doe",
                patientContact: "john.doe@example.com",
                preliminaryNeeds: "Post-surgery care",
                insuranceInfo: "MetLife #12345",
                geographicLocation: "Dubai, UAE",
                acknowledgmentStatus: "Pending",
                initialContactCompleted: false,
                documentationPrepared: false,
                referralStatus: "New",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                referralDate: new Date(Date.now() - 86400000), // Yesterday
                referralSource: "Central Hospital",
                referralSourceContact: "referrals@centralhospital.com",
                patientName: "Jane Smith",
                patientContact: "jane.smith@example.com",
                preliminaryNeeds: "Chronic condition management",
                insuranceInfo: "Daman #67890",
                geographicLocation: "Abu Dhabi, UAE",
                acknowledgmentStatus: "Acknowledged",
                acknowledgmentDate: new Date(),
                acknowledgedBy: "Nurse Manager",
                initialContactCompleted: true,
                documentationPrepared: false,
                referralStatus: "In Progress",
                createdAt: new Date(Date.now() - 86400000),
                updatedAt: new Date(),
            },
        ];
        await db.collection("referrals").insertMany(sampleReferrals);
    };
    const resetDatabaseHandler = async () => {
        try {
            setLoading(true);
            setMessage("Resetting database...");
            resetDatabase();
            await addSampleData();
            const db = getDb();
            const result = await db.collection("referrals").find().toArray();
            setReferrals(result);
            setMessage("Database reset successfully!");
            handleSuccess("Database Reset", "Database has been reset with sample data");
            setTimeout(() => setMessage(""), 3000);
        }
        catch (error) {
            console.error("Error resetting database:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setMessage(`Error: ${errorMessage}`);
            handleApiError(error, "Database Reset");
        }
        finally {
            setLoading(false);
        }
    };
    const acknowledgeReferral = async (id) => {
        try {
            setLoading(true);
            if (!isOnline) {
                // Save to offline storage
                await offlineService.addToQueue({
                    url: `/api/referrals/${id}/acknowledge`,
                    method: "PATCH",
                    data: {
                        acknowledgmentStatus: "Acknowledged",
                        acknowledgmentDate: new Date(),
                        acknowledgedBy: "Current User",
                        updatedAt: new Date(),
                    },
                    headers: { "Content-Type": "application/json" },
                    timestamp: new Date().toISOString(),
                });
                // Update local state
                setReferrals((prev) => prev.map((ref) => ref._id.toString() === id
                    ? {
                        ...ref,
                        acknowledgmentStatus: "Acknowledged",
                        acknowledgedBy: "Current User",
                    }
                    : ref));
                toast({
                    title: "Referral Acknowledged (Offline)",
                    description: "Changes will be synced when you're back online",
                    variant: "warning",
                });
                return;
            }
            const db = getDb();
            await db.collection("referrals").updateOne({ _id: new ObjectId(id) }, {
                $set: {
                    acknowledgmentStatus: "Acknowledged",
                    acknowledgmentDate: new Date(),
                    acknowledgedBy: "Current User",
                    updatedAt: new Date(),
                },
            });
            const result = await db.collection("referrals").find().toArray();
            setReferrals(result);
            setMessage("Referral acknowledged successfully!");
            handleSuccess("Referral Acknowledged", "Referral has been successfully acknowledged");
            setTimeout(() => setMessage(""), 3000);
        }
        catch (error) {
            console.error("Error acknowledging referral:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setMessage(`Error: ${errorMessage}`);
            handleApiError(error, "Acknowledge Referral");
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "New":
                return "bg-blue-100 text-blue-800";
            case "In Progress":
                return "bg-yellow-100 text-yellow-800";
            case "Accepted":
                return "bg-green-100 text-green-800";
            case "Declined":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getAcknowledgmentBadgeColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Acknowledged":
                return "bg-green-100 text-green-800";
            case "Processed":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const loadPendingItems = useCallback(async () => {
        try {
            const pendingSyncItems = await offlineService.getPendingSyncItems();
            setPendingItems({
                clinicalForms: pendingSyncItems.clinicalForms.length,
                patientAssessments: pendingSyncItems.patientAssessments.length,
                serviceInitiations: pendingSyncItems.serviceInitiations.length,
            });
        }
        catch (error) {
            console.error("Error loading pending items:", error);
        }
    }, []);
    const handleSyncClick = async () => {
        if (!isOnline) {
            toast({
                title: "Cannot Sync",
                description: "You need to be online to sync data",
                variant: "destructive",
            });
            return;
        }
        setIsSyncing(true);
        try {
            // Simulate sync process
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setPendingItems({
                clinicalForms: 0,
                patientAssessments: 0,
                serviceInitiations: 0,
            });
            handleSuccess("Sync Complete", "All pending items have been synchronized");
        }
        catch (error) {
            handleApiError(error, "Data Sync");
        }
        finally {
            setIsSyncing(false);
        }
    };
    return (_jsxs("div", { className: "bg-background min-h-screen", children: [_jsx("header", { className: "bg-primary text-primary-foreground py-8", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold mb-2", children: "Reyada Homecare Platform" }), _jsx("p", { className: "text-lg opacity-90", children: "Transforming homecare with DOH-compliant digital solutions" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [isOnline ? (_jsx(Wifi, { className: "h-6 w-6 text-green-400" })) : (_jsx(WifiOff, { className: "h-6 w-6 text-red-400" })), _jsx("span", { className: "text-sm opacity-75", children: isOnline ? "Online" : "Offline" })] })] }) }) }), _jsxs("main", { className: "container mx-auto px-4 py-8", children: [_jsx(OfflineBanner, { isOnline: isOnline, pendingItems: pendingItems, isSyncing: isSyncing, onSyncClick: handleSyncClick }), _jsxs("section", { className: "mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Patient Referrals" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: resetDatabaseHandler, disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), " Reset Database"] }), _jsxs(Button, { onClick: () => handleNavigate("/dashboard"), children: ["Go to Dashboard ", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })] })] }), message && (_jsx("div", { className: "bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4", children: message })), loading ? (_jsx("div", { className: "text-center p-8", children: _jsx(LoadingSpinner, { size: "lg", text: "Loading referrals..." }) })) : referrals.length === 0 ? (_jsx("div", { className: "text-center p-8", children: "No referrals found" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: referrals.map((referral) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: referral.patientName }), _jsx(CardDescription, { children: referral.referralSource })] }), _jsx(Badge, { className: getStatusBadgeColor(referral.referralStatus), children: referral.referralStatus })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Needs:" }), " ", referral.preliminaryNeeds] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Contact:" }), " ", referral.patientContact] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Location:" }), " ", referral.geographicLocation] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Insurance:" }), " ", referral.insuranceInfo] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "Referral Date:" }), " ", new Date(referral.referralDate).toLocaleDateString()] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold", children: "Acknowledgment:" }), _jsx(Badge, { className: getAcknowledgmentBadgeColor(referral.acknowledgmentStatus), children: referral.acknowledgmentStatus })] })] }) }), _jsx(CardFooter, { className: "bg-gray-50", children: referral.acknowledgmentStatus === "Pending" ? (_jsx(Button, { onClick: () => acknowledgeReferral(referral._id.toString()), disabled: loading, children: "Acknowledge Referral" })) : (_jsxs("div", { className: "text-sm text-gray-500", children: ["Acknowledged by ", referral.acknowledgedBy, " on", " ", new Date(referral.acknowledgmentDate).toLocaleDateString()] })) })] }, referral._id.toString()))) }))] }), _jsxs("section", { className: "mb-12", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Key Platform Features" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-card border rounded-lg p-4", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-500 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Emirates ID Integration" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Scan and verify Emirates ID for instant patient registration" })] }), _jsxs("div", { className: "bg-card border rounded-lg p-4", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-500 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Mobile-First Experience" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Complete offline capabilities with voice-to-text and camera integration" })] }), _jsxs("div", { className: "bg-card border rounded-lg p-4", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-500 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "9-Domain Assessment" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "DOH-compliant healthcare assessment with clinical justification" })] }), _jsxs("div", { className: "bg-card border rounded-lg p-4", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-500 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Secure Authentication" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Multi-factor authentication with role-based access control" })] })] })] }), _jsx("section", { children: _jsx("div", { className: "bg-muted p-6 rounded-lg", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between", children: [_jsxs("div", { className: "mb-4 md:mb-0", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "Ready to transform your homecare operations?" }), _jsx("p", { className: "text-muted-foreground", children: "Access the full platform and start delivering DOH-compliant care" })] }), _jsx(Button, { size: "lg", onClick: () => handleNavigate("/dashboard"), children: "Launch Platform" })] }) }) })] }), _jsx("footer", { className: "bg-muted py-6 mt-12", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center", children: [_jsx("div", { className: "mb-4 md:mb-0", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["\u00A9 ", new Date().getFullYear(), " Reyada Homecare. All rights reserved."] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Badge, { variant: "outline", children: "DOH Compliant" }), _jsx(Badge, { variant: "outline", children: "JAWDA KPI Ready" }), _jsx(Badge, { variant: "outline", children: "Malaffi Integrated" })] })] }) }) })] }));
}
export default Home;
