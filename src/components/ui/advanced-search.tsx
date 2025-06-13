import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface SearchFilter {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "dateRange" | "boolean" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: any;
}

export interface SearchQuery {
  query: string;
  filters: Record<string, any>;
}

interface AdvancedSearchProps {
  placeholder?: string;
  filters?: SearchFilter[];
  onSearch: (query: SearchQuery) => void;
  className?: string;
  showFilterCount?: boolean;
  enableSavedSearches?: boolean;
  savedSearches?: { id: string; name: string; query: SearchQuery }[];
  onSaveSearch?: (name: string, query: SearchQuery) => void;
  onLoadSearch?: (query: SearchQuery) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = "Search...",
  filters = [],
  onSearch,
  className,
  showFilterCount = true,
  enableSavedSearches = false,
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
}) => {
  const [query, setQuery] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>(
    {},
  );
  const [showFilters, setShowFilters] = React.useState(false);
  const [saveSearchName, setSaveSearchName] = React.useState("");

  const handleSearch = React.useCallback(() => {
    onSearch({ query, filters: activeFilters });
  }, [query, activeFilters, onSearch]);

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters((prev) => {
      if (value === undefined || value === null || value === "") {
        const { [filterId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [filterId]: value };
    });
  };

  const clearFilter = (filterId: string) => {
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

  const handleLoadSearch = (searchQuery: SearchQuery) => {
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

  const renderFilterInput = (filter: SearchFilter) => {
    const value = activeFilters[filter.id];

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            type={filter.type}
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleFilterChange(filter.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) =>
                handleFilterChange(filter.id, checked)
              }
            />
            <label className="text-sm">{filter.label}</label>
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : filter.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) =>
                  handleFilterChange(filter.id, date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "dateRange":
        return (
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !value?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.from ? format(new Date(value.from), "PPP") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value?.from ? new Date(value.from) : undefined}
                  onSelect={(date) =>
                    handleFilterChange(filter.id, {
                      ...value,
                      from: date?.toISOString(),
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !value?.to && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.to ? format(new Date(value.to), "PPP") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value?.to ? new Date(value.to) : undefined}
                  onSelect={(date) =>
                    handleFilterChange(filter.id, {
                      ...value,
                      to: date?.toISOString(),
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {showFilterCount && activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "rotate-180",
              )}
            />
          </Button>
        )}

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId);
            if (!filter) return null;

            let displayValue = value;
            if (filter.type === "date" && value) {
              displayValue = format(new Date(value), "MMM dd, yyyy");
            } else if (filter.type === "dateRange" && value) {
              displayValue = `${value.from ? format(new Date(value.from), "MMM dd") : ""} - ${value.to ? format(new Date(value.to), "MMM dd") : ""}`;
            } else if (filter.type === "select" && filter.options) {
              const option = filter.options.find((opt) => opt.value === value);
              displayValue = option?.label || value;
            }

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>
                  {filter.label}: {String(displayValue)}
                </span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => clearFilter(filterId)}
                />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {enableSavedSearches && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Save search as..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName}
                  size="sm"
                >
                  Save
                </Button>
              </div>

              {savedSearches.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm text-gray-500">Saved searches:</span>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((saved) => (
                      <Button
                        key={saved.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadSearch(saved.query)}
                      >
                        {saved.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
