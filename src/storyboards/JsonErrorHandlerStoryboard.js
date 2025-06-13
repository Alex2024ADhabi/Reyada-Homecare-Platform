import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function JsonErrorHandlerStoryboard() {
    const testData = {
        patientId: "P123456",
        serviceType: "home_nursing",
        clinicalJustification: "Patient requires comprehensive home nursing care due to post-surgical complications and mobility limitations.",
        providerId: "PRV-001-HN",
        documents: ["medical-report.pdf", "assessment-form.pdf"],
    };
    return (_jsx("div", { className: "bg-white p-6 min-h-screen", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold mb-2", children: "JSON Error Handler" }), _jsx("p", { className: "text-gray-600", children: "Comprehensive JSON validation and error handling component" })] }), _jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [_jsx("h3", { className: "font-medium mb-2", children: "Test Data:" }), _jsx("pre", { className: "text-sm overflow-auto", children: JSON.stringify(testData, null, 2) })] })] }) }));
}
