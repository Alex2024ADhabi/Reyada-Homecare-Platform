import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Textarea = React.forwardRef(({ className, dohField = false, complianceValidation = false, realTimeCheck = false, helpText, complianceError, validationStatus, dohRequirement, characterLimit, ...props }, ref) => {
    const [isValidating, setIsValidating] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(props.value || "");
    const [charCount, setCharCount] = React.useState(0);
    React.useEffect(() => {
        if (realTimeCheck && localValue && complianceValidation) {
            setIsValidating(true);
            const timer = setTimeout(() => {
                setIsValidating(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [localValue, realTimeCheck, complianceValidation]);
    const getValidationStyles = () => {
        if (complianceError) {
            return "border-red-500 focus-visible:ring-red-500";
        }
        if (validationStatus === "valid") {
            return "border-emerald-500 focus-visible:ring-emerald-500";
        }
        if (validationStatus === "pending" || isValidating) {
            return "border-blue-500 focus-visible:ring-blue-500";
        }
        return "";
    };
    const handleChange = (e) => {
        const value = e.target.value;
        setLocalValue(value);
        setCharCount(value.length);
        if (props.onChange) {
            props.onChange(e);
        }
    };
    return (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "relative", children: [_jsx("textarea", { className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", dohField && "border-l-4 border-l-indigo-500", getValidationStyles(), className), ref: ref, onChange: handleChange, "data-doh-field": dohField, "data-doh-requirement": dohRequirement, "data-compliance-validation": complianceValidation, "aria-describedby": helpText ? `${props.id}-help` : undefined, ...props }), (validationStatus || isValidating) && (_jsxs("div", { className: "absolute right-2 top-2", children: [isValidating && (_jsxs("svg", { className: "animate-spin h-4 w-4 text-blue-500", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), validationStatus === "valid" && (_jsx("svg", { className: "h-4 w-4 text-emerald-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })), validationStatus === "invalid" && (_jsx("svg", { className: "h-4 w-4 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }))] }))] }), characterLimit && (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", {}), _jsxs("span", { className: cn("text-gray-500", charCount > characterLimit && "text-red-500 font-medium"), children: [charCount, "/", characterLimit] })] })), helpText && (_jsx("p", { id: `${props.id}-help`, className: "text-xs text-gray-600", children: helpText })), dohRequirement && (_jsxs("p", { className: "text-xs text-indigo-600 font-medium", children: ["DOH Requirement: ", dohRequirement] })), complianceError && (_jsxs("p", { className: "text-xs text-red-600 flex items-center gap-1", children: [_jsx("svg", { className: "h-3 w-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), complianceError] }))] }));
});
Textarea.displayName = "Textarea";
export { Textarea };
