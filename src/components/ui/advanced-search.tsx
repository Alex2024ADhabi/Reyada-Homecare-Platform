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
  Save,
  History,
  Star,
  Download,
  Upload,
  Brain,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage, T } from "@/components/ui/multi-language-support";

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
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>(
    {},
  );
  const [showFilters, setShowFilters] = React.useState(false);
  const [saveSearchName, setSaveSearchName] = React.useState("");
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [favoriteSearches, setFavoriteSearches] = React.useState<string[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = React.useState(false);
  const [isSmartMode, setIsSmartMode] = React.useState(false);
  const [nlpSuggestions, setNlpSuggestions] = React.useState<string[]>([]);
  const [isProcessingNLP, setIsProcessingNLP] = React.useState(false);

  const handleSearch = React.useCallback(() => {
    if (isSmartMode && query) {
      processNaturalLanguageQuery(query);
    } else {
      onSearch({ query, filters: activeFilters });
    }
  }, [query, activeFilters, onSearch, isSmartMode]);

  const processNaturalLanguageQuery = async (naturalQuery: string) => {
    setIsProcessingNLP(true);
    try {
      // Enhanced NLP processing for medical terminology
      const processedQuery = await processWithNLP(naturalQuery);

      // Update search state with processed results
      setQuery(processedQuery.query || naturalQuery);
      setActiveFilters(processedQuery.filters || {});

      // Execute search with processed data
      onSearch({
        query: processedQuery.query || naturalQuery,
        filters: processedQuery.filters || {},
      });

      // Add to search history
      setSearchHistory((prev) => [naturalQuery, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("NLP processing failed:", error);
      // Fallback to regular search
      onSearch({ query: naturalQuery, filters: activeFilters });
    } finally {
      setIsProcessingNLP(false);
    }
  };

  const processWithNLP = async (
    query: string,
  ): Promise<{ query: string; filters: Record<string, any> }> => {
    // Enhanced medical terminology and revenue analytics context
    const medicalTerms = {
      diabetic: { condition: "diabetes" },
      hypertensive: { condition: "hypertension" },
      urgent: { priority: "urgent" },
      today: { date: new Date().toISOString().split("T")[0] },
      "this week": { dateRange: { from: getWeekStart(), to: getWeekEnd() } },
      pending: { status: "pending" },
      completed: { status: "completed" },
      "high risk": { riskLevel: "high" },
      medication: { category: "medication" },
      "wound care": { serviceType: "wound_care" },
      "physical therapy": { serviceType: "physical_therapy" },
      nursing: { serviceType: "nursing" },
      // Revenue analytics terms
      "high revenue": { revenueRange: "1000000+" },
      "low collection": { collectionRate: "0-70" },
      "denied claims": { status: "denied" },
      "overdue payments": { paymentStatus: "overdue" },
      "daman claims": { payer: "DAMAN" },
      "insurance claims": { category: "insurance" },
      "authorization pending": { authStatus: "pending" },
      "compliance issues": { complianceStatus: "non_compliant" },
    };

    let processedFilters: Record<string, any> = {};
    let processedQuery = query.toLowerCase();

    // Extract medical context and convert to filters
    Object.entries(medicalTerms).forEach(([term, filter]) => {
      if (processedQuery.includes(term)) {
        processedFilters = { ...processedFilters, ...filter };
        processedQuery = processedQuery.replace(term, "").trim();
      }
    });

    // Generate contextual suggestions
    const suggestions = generateMedicalSuggestions(query);
    setNlpSuggestions(suggestions);

    return {
      query: processedQuery || query,
      filters: processedFilters,
    };
  };

  const generateMedicalSuggestions = (query: string): string[] => {
    const suggestions = [
      "Show me all diabetic patients with urgent visits today",
      "Find pending medication reviews this week",
      "List high-risk patients needing wound care",
      "Show completed physical therapy sessions",
      "Find patients with overdue assessments",
      "Show nursing visits scheduled for tomorrow",
      // Revenue analytics suggestions
      "Show high revenue claims from this month",
      "Find denied claims with low collection rates",
      "List overdue payments from DAMAN",
      "Show authorization pending claims",
      "Find compliance issues in recent claims",
      "Display revenue trends for wound care services",
    ];

    return suggestions
      .filter(
        (s) =>
          s.toLowerCase().includes(query.toLowerCase()) ||
          query
            .toLowerCase()
            .split(" ")
            .some((word) => s.toLowerCase().includes(word)),
      )
      .slice(0, 3);
  };

  const getWeekStart = () => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    return start.toISOString();
  };

  const getWeekEnd = () => {
    const now = new Date();
    const end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return end.toISOString();
  };

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

  // Enhanced search with voice input and mobile optimization
  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = isRTL ? "ar-AE" : "en-US";
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch();
      };
      recognition.start();
    }
  };

  const handleExportSearch = () => {
    const searchData = {
      query,
      filters: activeFilters,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(searchData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const searchData = JSON.parse(e.target?.result as string);
          setQuery(searchData.query || "");
          setActiveFilters(searchData.filters || {});
        } catch (error) {
          console.error("Failed to import search:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={cn("w-full space-y-4", isRTL && "rtl", className)}>
      {/* Enhanced Search Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">
            <T k="common.search" />
          </h3>
          {isAdvancedMode && (
            <Badge variant="secondary">
              <T k="common.advanced" fallback="Advanced" />
            </Badge>
          )}
          {isSmartMode && (
            <Badge variant="default" className="bg-purple-100 text-purple-800">
              <Brain className="h-3 w-3 mr-1" />
              Smart Search
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isSmartMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSmartMode(!isSmartMode)}
            className={isSmartMode ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Brain className="h-4 w-4 mr-1" />
            {isSmartMode ? "Smart" : "Enable AI"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          >
            {isAdvancedMode ? (
              <T k="common.simple" fallback="Simple" />
            ) : (
              <T k="common.advanced" fallback="Advanced" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSearch}>
            <Download className="h-4 w-4" />
          </Button>
          <label>
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSearch}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Search Bar */}
      <div
        className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
      >
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4",
              isRTL ? "right-3" : "left-3",
            )}
          />
          <Input
            placeholder={
              isSmartMode
                ? "Ask me anything about your patients..."
                : t("common.search") || placeholder
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
              "text-base",
              isSmartMode && "border-purple-200 focus:border-purple-400",
            )}
            dir={isRTL ? "rtl" : "ltr"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          {isSmartMode && (
            <div
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2",
                isRTL ? "left-12" : "right-12",
              )}
            >
              {isProcessingNLP ? (
                <div className="animate-spin">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
              ) : (
                <Sparkles className="h-4 w-4 text-purple-600" />
              )}
            </div>
          )}
          {/* Voice Search Button */}
          {("webkitSpeechRecognition" in window ||
            "SpeechRecognition" in window) && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2",
                isRTL ? "left-2" : "right-2",
              )}
              onClick={handleVoiceSearch}
            >
              🎤
            </Button>
          )}
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <T k="common.filter" />
            {showFilterCount && activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "rotate-180",
              )}
            />
          </Button>
        )}

        <Button
          onClick={handleSearch}
          className={cn(
            "px-6",
            isSmartMode && "bg-purple-600 hover:bg-purple-700",
          )}
          disabled={isProcessingNLP}
        >
          {isProcessingNLP ? (
            <div className="animate-spin mr-2">
              <Zap className="h-4 w-4" />
            </div>
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          <T k="common.search" />
        </Button>
      </div>

      {/* NLP Suggestions */}
      {isSmartMode && nlpSuggestions.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Smart Suggestions
            </span>
          </div>
          <div className="space-y-1">
            {nlpSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto py-2 px-3 text-purple-700 hover:bg-purple-100"
                onClick={() => {
                  setQuery(suggestion);
                  processNaturalLanguageQuery(suggestion);
                }}
              >
                <Sparkles className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions and History */}
      {isAdvancedMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <T k="search.history" fallback="Search History" />
                </span>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setQuery(search)}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Searches */}
          {favoriteSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <T k="search.favorites" fallback="Favorite Searches" />
                </span>
              </div>
              <div className="space-y-1">
                {favoriteSearches.slice(0, 5).map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => setQuery(search)}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">
            <T k="search.activeFilters" fallback="Active filters:" />
          </span>
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
            <T k="common.clear" />
          </Button>
        </div>
      )}

      {/* Enhanced Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="border rounded-lg p-4 space-y-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <T k="search.filters" fallback="Search Filters" />
            </h4>
            <Badge variant="outline">
              {activeFilterCount} / {filters.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="space-y-2 p-3 bg-white rounded-lg border"
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  {filter.label}
                  {filter.type === "date" && (
                    <CalendarIcon className="h-3 w-3" />
                  )}
                  {filter.type === "select" && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {enableSavedSearches && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">
                  <T k="search.saveSearch" fallback="Save Search" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={
                    t("search.saveAsPlaceholder") || "Save search as..."
                  }
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  className="flex-1"
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName}
                  size="sm"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  <T k="common.save" />
                </Button>
              </div>

              {savedSearches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-500">
                    <T k="search.savedSearches" fallback="Saved searches:" />
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {savedSearches.map((saved) => (
                      <Button
                        key={saved.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadSearch(saved.query)}
                        className="justify-start text-left truncate"
                      >
                        <Star className="h-3 w-3 mr-1 flex-shrink-0" />
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
