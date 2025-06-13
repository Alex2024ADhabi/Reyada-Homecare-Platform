import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Code, DollarSign, AlertTriangle, CheckCircle, XCircle, ArrowRight, Calendar, RefreshCw, Search, Filter, } from "lucide-react";
import { cn } from "@/lib/utils";
const ServiceCodeManager = ({ className = "", }) => {
    const [serviceCodes, setServiceCodes] = useState([]);
    const [codeMappings, setCodeMappings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("codes");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadServiceCodes();
        loadCodeMappings();
    }, []);
    const loadServiceCodes = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockCodes = [
                {
                    id: "sc-001",
                    code: "17-25-1",
                    description: "Simple Home Visit - Nursing",
                    category: "nursing",
                    price: 300,
                    currency: "AED",
                    status: "active",
                    effectiveDate: "2024-06-01",
                    usageCount: 245,
                    lastUsed: "2024-03-15",
                    complianceNotes: ["DOH approved June 2024", "Daman standard pricing"],
                    dohApproved: true,
                    damanApproved: true,
                },
                {
                    id: "sc-002",
                    code: "17-25-2",
                    description: "Simple Home Visit - Supportive",
                    category: "supportive",
                    price: 300,
                    currency: "AED",
                    status: "active",
                    effectiveDate: "2024-06-01",
                    usageCount: 189,
                    lastUsed: "2024-03-14",
                    complianceNotes: ["DOH approved June 2024"],
                    dohApproved: true,
                    damanApproved: true,
                },
                {
                    id: "sc-003",
                    code: "17-25-3",
                    description: "Specialized Home Visit - Consultation",
                    category: "consultation",
                    price: 800,
                    currency: "AED",
                    status: "active",
                    effectiveDate: "2024-06-01",
                    usageCount: 67,
                    lastUsed: "2024-03-13",
                    complianceNotes: ["Higher tier pricing approved"],
                    dohApproved: true,
                    damanApproved: true,
                },
                {
                    id: "sc-004",
                    code: "17-25-4",
                    description: "Routine Home Nursing Care",
                    category: "routine",
                    price: 900,
                    currency: "AED",
                    status: "active",
                    effectiveDate: "2024-06-01",
                    usageCount: 134,
                    lastUsed: "2024-03-16",
                    complianceNotes: [],
                    dohApproved: true,
                    damanApproved: true,
                },
                {
                    id: "sc-005",
                    code: "17-25-5",
                    description: "Advanced Home Nursing Care",
                    category: "advanced",
                    price: 1800,
                    currency: "AED",
                    status: "active",
                    effectiveDate: "2024-06-01",
                    usageCount: 89,
                    lastUsed: "2024-03-12",
                    complianceNotes: ["Premium tier service"],
                    dohApproved: true,
                    damanApproved: true,
                },
                {
                    id: "sc-006",
                    code: "17-26-1",
                    description: "Legacy Home Visit - Basic",
                    category: "nursing",
                    price: 250,
                    currency: "AED",
                    status: "deprecated",
                    effectiveDate: "2023-01-01",
                    deprecationDate: "2024-06-01",
                    replacementCode: "17-25-1",
                    usageCount: 0,
                    lastUsed: "2024-05-31",
                    complianceNotes: ["Deprecated - use 17-25-1 instead"],
                    dohApproved: false,
                    damanApproved: false,
                },
                {
                    id: "sc-007",
                    code: "17-26-2",
                    description: "Legacy Home Visit - Standard",
                    category: "supportive",
                    price: 350,
                    currency: "AED",
                    status: "deprecated",
                    effectiveDate: "2023-01-01",
                    deprecationDate: "2024-06-01",
                    replacementCode: "17-25-2",
                    usageCount: 0,
                    lastUsed: "2024-05-30",
                    complianceNotes: ["Deprecated - use 17-25-2 instead"],
                    dohApproved: false,
                    damanApproved: false,
                },
            ];
            setServiceCodes(mockCodes);
        }
        catch (error) {
            console.error("Error loading service codes:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadCodeMappings = async () => {
        try {
            const mockMappings = [
                {
                    oldCode: "17-26-1",
                    newCode: "17-25-1",
                    mappingType: "direct",
                    effectiveDate: "2024-06-01",
                    conversionRules: [
                        "Direct 1:1 mapping",
                        "Price updated from 250 to 300 AED",
                        "Same service category maintained",
                    ],
                    status: "completed",
                },
                {
                    oldCode: "17-26-2",
                    newCode: "17-25-2",
                    mappingType: "direct",
                    effectiveDate: "2024-06-01",
                    conversionRules: [
                        "Direct 1:1 mapping",
                        "Price updated from 350 to 300 AED",
                        "Service standardization applied",
                    ],
                    status: "completed",
                },
                {
                    oldCode: "17-26-3",
                    newCode: "17-25-3",
                    mappingType: "conditional",
                    effectiveDate: "2024-06-01",
                    conversionRules: [
                        "Map to 17-25-3 for consultation services",
                        "Map to 17-25-4 for routine care",
                        "Requires manual review for complex cases",
                    ],
                    status: "pending",
                },
            ];
            setCodeMappings(mockMappings);
        }
        catch (error) {
            console.error("Error loading code mappings:", error);
        }
    };
    const refreshData = async () => {
        setRefreshing(true);
        await Promise.all([loadServiceCodes(), loadCodeMappings()]);
        setRefreshing(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "deprecated":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case "nursing":
                return "bg-blue-100 text-blue-800";
            case "supportive":
                return "bg-purple-100 text-purple-800";
            case "consultation":
                return "bg-indigo-100 text-indigo-800";
            case "routine":
                return "bg-green-100 text-green-800";
            case "advanced":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const validatePricing = (code) => {
        const warnings = [];
        if (code.price < 200) {
            warnings.push("Price below minimum threshold");
        }
        if (code.price > 2000) {
            warnings.push("Price above standard range");
        }
        if (!code.dohApproved) {
            warnings.push("DOH approval pending");
        }
        if (!code.damanApproved) {
            warnings.push("Daman approval pending");
        }
        return warnings;
    };
    const filteredCodes = serviceCodes.filter((code) => {
        const matchesStatus = filterStatus === "all" || code.status === filterStatus;
        const matchesSearch = searchTerm === "" ||
            code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    const activeCodes = serviceCodes.filter((code) => code.status === "active");
    const deprecatedCodes = serviceCodes.filter((code) => code.status === "deprecated");
    const pendingCodes = serviceCodes.filter((code) => code.status === "pending");
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading service codes..." })] }) }));
    }
    return (_jsxs("div", { className: cn("space-y-6 bg-gray-50 min-h-screen p-6", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Code, { className: "h-6 w-6 mr-3 text-blue-600" }), "Service Code Manager"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage service codes (17-25-x), detect deprecated codes, and validate pricing" })] }), _jsxs(Button, { onClick: refreshData, disabled: refreshing, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(RefreshCw, { className: cn("h-4 w-4 mr-2", refreshing && "animate-spin") }), "Refresh"] })] }), deprecatedCodes.length > 0 && (_jsxs(Alert, { variant: "compliance-high", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Deprecated Service Codes Detected" }), _jsxs(AlertDescription, { children: [deprecatedCodes.length, " deprecated service code(s) found. Please update to use the new 17-25-x series codes."] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Active Codes" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: activeCodes.length })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Deprecated" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: deprecatedCodes.length })] }), _jsx(XCircle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending Approval" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: pendingCodes.length })] }), _jsx(Calendar, { className: "h-8 w-8 text-yellow-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Avg Price" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [Math.round(activeCodes.reduce((sum, code) => sum + code.price, 0) /
                                                        activeCodes.length), " ", "AED"] })] }), _jsx(DollarSign, { className: "h-8 w-8 text-blue-500" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "codes", children: "Service Codes" }), _jsx(TabsTrigger, { value: "mappings", children: "Code Mappings" }), _jsx(TabsTrigger, { value: "pricing", children: "Pricing Validation" }), _jsx(TabsTrigger, { value: "analytics", children: "Usage Analytics" })] }), _jsx(TabsContent, { value: "codes", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Service Codes Management" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "h-4 w-4 text-gray-500" }), _jsx("input", { type: "text", placeholder: "Search codes...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "px-3 py-1 border rounded-md text-sm" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4 text-gray-500" }), _jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "deprecated", children: "Deprecated" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" })] })] })] })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredCodes.map((code) => {
                                            const warnings = validatePricing(code);
                                            return (_jsx(Card, { className: cn("transition-all hover:shadow-md", code.status === "deprecated" &&
                                                    "border-l-4 border-l-red-500", warnings.length > 0 && "border-l-4 border-l-yellow-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold text-lg", children: code.code }), _jsx(Badge, { className: getStatusColor(code.status), children: code.status }), _jsx(Badge, { className: getCategoryColor(code.category), children: code.category }), code.dohApproved && (_jsx(Badge, { className: "bg-indigo-100 text-indigo-800", children: "DOH" })), code.damanApproved && (_jsx(Badge, { className: "bg-green-100 text-green-800", children: "Daman" }))] }), _jsx("p", { className: "text-gray-700 mb-3", children: code.description }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Price:" }), _jsxs("p", { className: "font-medium", children: [code.price, " ", code.currency] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Usage Count:" }), _jsx("p", { className: "font-medium", children: code.usageCount })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Last Used:" }), _jsx("p", { className: "font-medium", children: new Date(code.lastUsed).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Effective:" }), _jsx("p", { className: "font-medium", children: new Date(code.effectiveDate).toLocaleDateString() })] })] }), code.replacementCode && (_jsx("div", { className: "mt-3 p-2 bg-yellow-50 rounded", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ArrowRight, { className: "h-4 w-4 text-yellow-600" }), _jsxs("span", { className: "text-sm text-yellow-800", children: ["Use ", code.replacementCode, " instead"] })] }) })), warnings.length > 0 && (_jsxs("div", { className: "mt-3 p-2 bg-yellow-50 rounded", children: [_jsx("h4", { className: "font-medium text-yellow-800 mb-1", children: "Validation Warnings:" }), _jsx("ul", { className: "text-sm text-yellow-700 space-y-1", children: warnings.map((warning, index) => (_jsxs("li", { children: ["\u2022 ", warning] }, index))) })] })), code.complianceNotes.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "font-medium text-gray-800 mb-1", children: "Compliance Notes:" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: code.complianceNotes.map((note, index) => (_jsxs("li", { children: ["\u2022 ", note] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "Edit Code" }), code.status === "deprecated" && (_jsx(Button, { size: "sm", className: "bg-orange-600 hover:bg-orange-700", children: "Convert" }))] })] }) }) }, code.id));
                                        }) }) })] }) }), _jsx(TabsContent, { value: "mappings", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Code Mapping & Conversion" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { variant: "doh-requirement", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Code Migration Guidelines" }), _jsx(AlertDescription, { children: "All 17-26-x codes have been deprecated as of June 1, 2024. Use the mapping table below to convert to new 17-25-x codes." })] }), codeMappings.map((mapping, index) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-mono font-bold text-red-600", children: mapping.oldCode }), _jsx("p", { className: "text-xs text-gray-500", children: "Deprecated" })] }), _jsx(ArrowRight, { className: "h-6 w-6 text-gray-400" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-mono font-bold text-green-600", children: mapping.newCode }), _jsx("p", { className: "text-xs text-gray-500", children: "Active" })] }), _jsx(Badge, { className: cn(mapping.mappingType === "direct"
                                                                                ? "bg-green-100 text-green-800"
                                                                                : "bg-yellow-100 text-yellow-800"), children: mapping.mappingType }), _jsx(Badge, { className: cn(mapping.status === "completed"
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "bg-orange-100 text-orange-800"), children: mapping.status })] }), _jsx(Button, { size: "sm", variant: "outline", children: "View Details" })] }), _jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "font-medium text-gray-800 mb-2", children: "Conversion Rules:" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: mapping.conversionRules.map((rule, ruleIndex) => (_jsxs("li", { children: ["\u2022 ", rule] }, ruleIndex))) })] })] }) }, index)))] }) })] }) }), _jsx(TabsContent, { value: "pricing", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pricing Validation" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: activeCodes.map((code) => {
                                            const warnings = validatePricing(code);
                                            return (_jsx(Card, { className: cn(warnings.length > 0 && "border-l-4 border-l-yellow-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsxs("h3", { className: "font-semibold", children: [code.code, " - ", code.description] }), warnings.length === 0 ? (_jsxs(Badge, { className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Valid"] })) : (_jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), "Warnings"] }))] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Current Price:" }), _jsxs("p", { className: "font-medium text-lg", children: [code.price, " ", code.currency] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "DOH Status:" }), _jsx("p", { className: cn("font-medium", code.dohApproved
                                                                                            ? "text-green-600"
                                                                                            : "text-red-600"), children: code.dohApproved ? "Approved" : "Pending" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Daman Status:" }), _jsx("p", { className: cn("font-medium", code.damanApproved
                                                                                            ? "text-green-600"
                                                                                            : "text-red-600"), children: code.damanApproved ? "Approved" : "Pending" })] })] }), warnings.length > 0 && (_jsxs("div", { className: "mt-3 p-2 bg-yellow-50 rounded", children: [_jsx("h4", { className: "font-medium text-yellow-800 mb-1", children: "Pricing Issues:" }), _jsx("ul", { className: "text-sm text-yellow-700 space-y-1", children: warnings.map((warning, index) => (_jsxs("li", { children: ["\u2022 ", warning] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Button, { size: "sm", variant: "outline", children: "Update Price" }), warnings.length > 0 && (_jsx(Button, { size: "sm", className: "bg-yellow-600 hover:bg-yellow-700", children: "Fix Issues" }))] })] }) }) }, code.id));
                                        }) }) })] }) }), _jsx(TabsContent, { value: "analytics", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Usage Statistics" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: activeCodes
                                                    .sort((a, b) => b.usageCount - a.usageCount)
                                                    .slice(0, 5)
                                                    .map((code) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: code.code }), _jsx("p", { className: "text-sm text-gray-600", children: code.description })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold", children: code.usageCount }), _jsx("p", { className: "text-sm text-gray-600", children: "uses" })] })] }, code.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue by Category" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [
                                                    "nursing",
                                                    "supportive",
                                                    "consultation",
                                                    "routine",
                                                    "advanced",
                                                ].map((category) => {
                                                    const categoryCodes = activeCodes.filter((code) => code.category === category);
                                                    const totalRevenue = categoryCodes.reduce((sum, code) => sum + code.price * code.usageCount, 0);
                                                    return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium capitalize", children: category }), _jsxs("p", { className: "text-sm text-gray-600", children: [categoryCodes.length, " codes"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-bold", children: [totalRevenue.toLocaleString(), " AED"] }), _jsx("p", { className: "text-sm text-gray-600", children: "revenue" })] })] }, category));
                                                }) }) })] })] }) })] })] }));
};
export default ServiceCodeManager;
