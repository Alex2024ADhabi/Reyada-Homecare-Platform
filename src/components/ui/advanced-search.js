import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, Calendar as CalendarIcon, ChevronDown, } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export const AdvancedSearch = ({ placeholder = "Search...", filters = [], onSearch, className, showFilterCount = true, enableSavedSearches = false, savedSearches = [], onSaveSearch, onLoadSearch, }) => {
    const [query, setQuery] = React.useState("");
    const [activeFilters, setActiveFilters] = React.useState({});
    const [showFilters, setShowFilters] = React.useState(false);
    const [saveSearchName, setSaveSearchName] = React.useState("");
    const handleSearch = React.useCallback(() => {
        onSearch({ query, filters: activeFilters });
    }, [query, activeFilters, onSearch]);
    const handleFilterChange = (filterId, value) => {
        setActiveFilters((prev) => {
            if (value === undefined || value === null || value === "") {
                const { [filterId]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [filterId]: value };
        });
    };
    const clearFilter = (filterId) => {
        handleFilterChange(filterId, undefined);
    };
    const clearAllFilters = () => {
        setActiveFilters({});
        setQuery("");
    };
    const activeFilterCount = Object.keys(activeFilters).length;
    const handleSaveSearch = () => {
        if (saveSearchName && onSaveSearch) {
            onSaveSearch(saveSearchName, { query, filters: activeFilters });
            setSaveSearchName("");
        }
    };
    const handleLoadSearch = (searchQuery) => {
        setQuery(searchQuery.query);
        setActiveFilters(searchQuery.filters);
        if (onLoadSearch) {
            onLoadSearch(searchQuery);
        }
    };
    React.useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [handleSearch]);
    const renderFilterInput = (filter) => {
        const value = activeFilters[filter.id];
        switch (filter.type) {
            case "text":
            case "number":
                return (_jsx(Input, { type: filter.type, placeholder: filter.placeholder, value: value || "", onChange: (e) => handleFilterChange(filter.id, e.target.value) }));
            case "select":
                return (_jsxs(Select, { value: value || "", onValueChange: (val) => handleFilterChange(filter.id, val), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: filter.placeholder }) }), _jsx(SelectContent, { children: filter.options?.map((option) => (_jsx(SelectItem, { value: option.value, children: option.label }, option.value))) })] }));
            case "boolean":
                return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { checked: value || false, onCheckedChange: (checked) => handleFilterChange(filter.id, checked) }), _jsx("label", { className: "text-sm", children: filter.label })] }));
            case "date":
                return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("justify-start text-left font-normal", !value && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), value ? format(new Date(value), "PPP") : filter.placeholder] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: value ? new Date(value) : undefined, onSelect: (date) => handleFilterChange(filter.id, date?.toISOString()), initialFocus: true }) })] }));
            case "dateRange":
                return (_jsxs("div", { className: "flex space-x-2", children: [_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("justify-start text-left font-normal flex-1", !value?.from && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), value?.from ? format(new Date(value.from), "PPP") : "From"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: value?.from ? new Date(value.from) : undefined, onSelect: (date) => handleFilterChange(filter.id, {
                                            ...value,
                                            from: date?.toISOString(),
                                        }), initialFocus: true }) })] }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("justify-start text-left font-normal flex-1", !value?.to && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), value?.to ? format(new Date(value.to), "PPP") : "To"] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: value?.to ? new Date(value.to) : undefined, onSelect: (date) => handleFilterChange(filter.id, {
                                            ...value,
                                            to: date?.toISOString(),
                                        }), initialFocus: true }) })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: cn("w-full space-y-4", className), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: placeholder, value: query, onChange: (e) => setQuery(e.target.value), className: "pl-10 pr-4", onKeyDown: (e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                } })] }), filters.length > 0 && (_jsxs(Button, { variant: "outline", onClick: () => setShowFilters(!showFilters), className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4" }), _jsx("span", { children: "Filters" }), showFilterCount && activeFilterCount > 0 && (_jsx(Badge, { variant: "secondary", className: "ml-1", children: activeFilterCount })), _jsx(ChevronDown, { className: cn("h-4 w-4 transition-transform", showFilters && "rotate-180") })] })), _jsx(Button, { onClick: handleSearch, children: "Search" })] }), activeFilterCount > 0 && (_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Active filters:" }), Object.entries(activeFilters).map(([filterId, value]) => {
                        const filter = filters.find((f) => f.id === filterId);
                        if (!filter)
                            return null;
                        let displayValue = value;
                        if (filter.type === "date" && value) {
                            displayValue = format(new Date(value), "MMM dd, yyyy");
                        }
                        else if (filter.type === "dateRange" && value) {
                            displayValue = `${value.from ? format(new Date(value.from), "MMM dd") : ""} - ${value.to ? format(new Date(value.to), "MMM dd") : ""}`;
                        }
                        else if (filter.type === "select" && filter.options) {
                            const option = filter.options.find((opt) => opt.value === value);
                            displayValue = option?.label || value;
                        }
                        return (_jsxs(Badge, { variant: "secondary", className: "flex items-center space-x-1", children: [_jsxs("span", { children: [filter.label, ": ", String(displayValue)] }), _jsx(X, { className: "h-3 w-3 cursor-pointer", onClick: () => clearFilter(filterId) })] }, filterId));
                    }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllFilters, className: "text-xs", children: "Clear all" })] })), showFilters && filters.length > 0 && (_jsxs("div", { className: "border rounded-lg p-4 space-y-4 bg-gray-50", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filters.map((filter) => (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: filter.label }), renderFilterInput(filter)] }, filter.id))) }), enableSavedSearches && (_jsxs("div", { className: "border-t pt-4 space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { placeholder: "Save search as...", value: saveSearchName, onChange: (e) => setSaveSearchName(e.target.value), className: "flex-1" }), _jsx(Button, { onClick: handleSaveSearch, disabled: !saveSearchName, size: "sm", children: "Save" })] }), savedSearches.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Saved searches:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: savedSearches.map((saved) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleLoadSearch(saved.query), children: saved.name }, saved.id))) })] }))] }))] }))] }));
};
export default AdvancedSearch;
