import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function ManpowerCapacityReport({ data, }) {
    const [activeTab, setActiveTab] = useState("summary");
    // Calculate summary statistics
    const totalStaff = data.length;
    const availableStaff = data.filter((staff) => staff.availability_status === "Available").length;
    const unavailableStaff = totalStaff - availableStaff;
    // Calculate capacity utilization
    const totalCapacity = data.reduce((sum, staff) => sum + staff.max_daily_patients, 0);
    const usedCapacity = data.reduce((sum, staff) => sum + staff.current_daily_patients, 0);
    const capacityUtilizationPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
    // Calculate hours utilization
    const totalAvailableHours = data.reduce((sum, staff) => sum + staff.available_hours_per_day, 0);
    const totalCommittedHours = data.reduce((sum, staff) => sum + staff.committed_hours_per_day, 0);
    const hoursUtilizationPercentage = totalAvailableHours > 0
        ? (totalCommittedHours / totalAvailableHours) * 100
        : 0;
    // Group by role
    const staffByRole = data.reduce((acc, staff) => {
        const role = staff.role;
        if (!acc[role])
            acc[role] = [];
        acc[role].push(staff);
        return acc;
    }, {});
    // Group by zone
    const staffByZone = data.reduce((acc, staff) => {
        const zone = staff.geographic_zones;
        if (!acc[zone])
            acc[zone] = [];
        acc[zone].push(staff);
        return acc;
    }, {});
    // Group by certification level
    const staffByCertification = data.reduce((acc, staff) => {
        const cert = staff.certification_level;
        if (!acc[cert])
            acc[cert] = [];
        acc[cert].push(staff);
        return acc;
    }, {});
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "summary", children: "Summary" }), _jsx(TabsTrigger, { value: "byRole", children: "By Role" }), _jsx(TabsTrigger, { value: "byZone", children: "By Zone" }), _jsx(TabsTrigger, { value: "byCertification", children: "By Certification" })] }), _jsxs(TabsContent, { value: "summary", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Total Staff" }), _jsx(CardDescription, { children: "All registered staff members" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold", children: totalStaff }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Available Staff" }), _jsx(CardDescription, { children: "Staff currently available" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: availableStaff }), _jsxs("div", { className: "text-sm text-gray-500", children: [totalStaff > 0
                                                            ? ((availableStaff / totalStaff) * 100).toFixed(1)
                                                            : 0, "% of total"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Patient Capacity" }), _jsx(CardDescription, { children: "Current utilization" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [usedCapacity, " / ", totalCapacity] }), _jsxs("div", { className: "text-sm text-gray-500", children: [capacityUtilizationPercentage.toFixed(1), "% utilized"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Hours Committed" }), _jsx(CardDescription, { children: "Of total available hours" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [totalCommittedHours, " / ", totalAvailableHours] }), _jsxs("div", { className: "text-sm text-gray-500", children: [hoursUtilizationPercentage.toFixed(1), "% utilized"] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Staff Availability Overview" }), _jsx(CardDescription, { children: "Current staff availability status" })] }), _jsx(CardContent, { children: _jsx("div", { className: "relative h-60", children: _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { children: "Available" }), _jsxs("span", { children: [availableStaff, " (", totalStaff > 0
                                                                        ? ((availableStaff / totalStaff) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-green-600 h-4 rounded-full", style: {
                                                                width: `${totalStaff > 0 ? (availableStaff / totalStaff) * 100 : 0}%`,
                                                            } }) }), _jsxs("div", { className: "flex justify-between mb-2 mt-4", children: [_jsx("span", { children: "Unavailable" }), _jsxs("span", { children: [unavailableStaff, " (", totalStaff > 0
                                                                        ? ((unavailableStaff / totalStaff) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-gray-500 h-4 rounded-full", style: {
                                                                width: `${totalStaff > 0 ? (unavailableStaff / totalStaff) * 100 : 0}%`,
                                                            } }) }), _jsxs("div", { className: "flex justify-between mb-2 mt-4", children: [_jsx("span", { children: "Patient Capacity Used" }), _jsxs("span", { children: [capacityUtilizationPercentage.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-blue-600 h-4 rounded-full", style: { width: `${capacityUtilizationPercentage}%` } }) })] }) }) }) })] })] }), _jsx(TabsContent, { value: "byRole", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Staff Distribution by Role" }), _jsx(CardDescription, { children: "Number of staff members in each role" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: Object.entries(staffByRole).map(([role, staffList]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-medium", children: role }), _jsxs("span", { children: [staffList.length, " staff"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                        width: `${(staffList.length / totalStaff) * 100}%`,
                                                    } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Available:", " ", staffList.filter((s) => s.availability_status === "Available").length, " ", "| Patient Capacity:", " ", staffList.reduce((sum, s) => sum + s.current_daily_patients, 0), " ", "/", " ", staffList.reduce((sum, s) => sum + s.max_daily_patients, 0)] })] }, role))) }) })] }) }), _jsx(TabsContent, { value: "byZone", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Staff Distribution by Geographic Zone" }), _jsx(CardDescription, { children: "Staff allocation across different zones" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: Object.entries(staffByZone).map(([zone, staffList]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-medium", children: zone }), _jsxs("span", { children: [staffList.length, " staff"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                        width: `${(staffList.length / totalStaff) * 100}%`,
                                                    } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Available:", " ", staffList.filter((s) => s.availability_status === "Available").length, " ", "| Patient Capacity:", " ", staffList.reduce((sum, s) => sum + s.current_daily_patients, 0), " ", "/", " ", staffList.reduce((sum, s) => sum + s.max_daily_patients, 0)] })] }, zone))) }) })] }) }), _jsx(TabsContent, { value: "byCertification", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Staff Distribution by Certification Level" }), _jsx(CardDescription, { children: "Staff qualification levels" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: Object.entries(staffByCertification).map(([cert, staffList]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-medium", children: cert }), _jsxs("span", { children: [staffList.length, " staff"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                        width: `${(staffList.length / totalStaff) * 100}%`,
                                                    } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Available:", " ", staffList.filter((s) => s.availability_status === "Available").length, " ", "| Roles:", " ", [...new Set(staffList.map((s) => s.role))].join(", ")] })] }, cert))) }) })] }) })] }) }));
}
