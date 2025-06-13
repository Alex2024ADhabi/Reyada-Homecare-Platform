import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { BookOpen, Play, FileText, Image, Download, Search, Filter, Clock, Star, Eye, Bookmark, Share, } from "lucide-react";
import { useEducationalResources } from "@/hooks/useEducationalResources";
export const HealthEducationModules = ({ patientId, recommendations, className = "", }) => {
    const { resources, categories, isLoading, searchResources, markAsViewed, bookmarkResource, removeBookmark, } = useEducationalResources(patientId);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [activeTab, setActiveTab] = useState("recommended");
    const getTypeIcon = (type) => {
        switch (type) {
            case "video":
                return _jsx(Play, { className: "h-4 w-4" });
            case "article":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "infographic":
                return _jsx(Image, { className: "h-4 w-4" });
            case "pdf":
                return _jsx(Download, { className: "h-4 w-4" });
            default:
                return _jsx(BookOpen, { className: "h-4 w-4" });
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "beginner":
                return "bg-green-100 text-green-800";
            case "intermediate":
                return "bg-yellow-100 text-yellow-800";
            case "advanced":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const handleResourceClick = async (resource) => {
        try {
            await markAsViewed(resource.id);
            if (resource.url) {
                window.open(resource.url, "_blank");
            }
        }
        catch (error) {
            console.error("Failed to mark resource as viewed:", error);
        }
    };
    const handleBookmark = async (resourceId, isBookmarked) => {
        try {
            if (isBookmarked) {
                await removeBookmark(resourceId);
            }
            else {
                await bookmarkResource(resourceId);
            }
        }
        catch (error) {
            console.error("Failed to update bookmark:", error);
        }
    };
    const filteredResources = resources.filter((resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
        const matchesType = selectedType === "all" || resource.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });
    const ResourceCard = ({ resource, isRecommended = false, }) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getTypeIcon(resource.type), _jsx(Badge, { className: getDifficultyColor(resource.difficulty), children: resource.difficulty }), isRecommended && (_jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [_jsx(Star, { className: "h-3 w-3 mr-1" }), "Recommended"] }))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleBookmark(resource.id, false), children: _jsx(Bookmark, { className: "h-4 w-4" }) })] }), resource.thumbnailUrl && (_jsx("div", { className: "mb-3", children: _jsx("img", { src: resource.thumbnailUrl, alt: resource.title, className: "w-full h-32 object-cover rounded-lg" }) })), _jsx("h3", { className: "font-medium text-gray-900 mb-2 line-clamp-2", children: resource.title }), _jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-3", children: resource.description }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-500 mb-3", children: [_jsx("span", { className: "capitalize", children: resource.category }), resource.duration && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: [Math.ceil(resource.duration / 60), " min"] })] }))] }), _jsxs("div", { className: "flex flex-wrap gap-1 mb-3", children: [resource.tags.slice(0, 3).map((tag) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: tag }, tag))), resource.tags.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", resource.tags.length - 3, " more"] }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { onClick: () => handleResourceClick(resource), className: "flex-1 mr-2", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), resource.type === "video" ? "Watch" : "Read"] }), _jsx(Button, { variant: "outline", size: "sm", children: _jsx(Share, { className: "h-4 w-4" }) })] })] }) }, resource.id));
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Health Education" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Personalized health information and educational resources" })] }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search resources...", className: "pl-10" })] }), _jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Categories" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), categories.map((category) => (_jsx(SelectItem, { value: category, children: category }, category)))] })] }), _jsxs(Select, { value: selectedType, onValueChange: setSelectedType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Types" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "article", children: "Articles" }), _jsx(SelectItem, { value: "video", children: "Videos" }), _jsx(SelectItem, { value: "infographic", children: "Infographics" }), _jsx(SelectItem, { value: "pdf", children: "PDFs" }), _jsx(SelectItem, { value: "interactive", children: "Interactive" })] })] }), _jsxs(Button, { variant: "outline", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "More Filters"] })] }) }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "recommended", children: "Recommended" }), _jsx(TabsTrigger, { value: "all", children: "All Resources" }), _jsx(TabsTrigger, { value: "bookmarked", children: "Bookmarked" }), _jsx(TabsTrigger, { value: "recent", children: "Recently Viewed" })] }), _jsx(TabsContent, { value: "recommended", className: "space-y-6", children: recommendations.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: recommendations.map((resource) => (_jsx(ResourceCard, { resource: resource, isRecommended: true }, resource.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(BookOpen, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Recommendations Yet" }), _jsx("p", { className: "text-gray-500", children: "We'll provide personalized recommendations based on your care plan and health goals." })] })) }), _jsx(TabsContent, { value: "all", className: "space-y-6", children: isLoading ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx(Card, { className: "animate-pulse", children: _jsxs(CardContent, { className: "p-4", children: [_jsx("div", { className: "h-32 bg-gray-200 rounded-lg mb-3" }), _jsx("div", { className: "h-4 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded mb-3" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }) }, i))) })) : filteredResources.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredResources.map((resource) => (_jsx(ResourceCard, { resource: resource }, resource.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Search, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Resources Found" }), _jsx("p", { className: "text-gray-500", children: "Try adjusting your search criteria or browse different categories." })] })) }), _jsx(TabsContent, { value: "bookmarked", className: "space-y-6", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Bookmark, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Bookmarked Resources" }), _jsx("p", { className: "text-gray-500", children: "Bookmark resources you want to save for later by clicking the bookmark icon." })] }) }), _jsx(TabsContent, { value: "recent", className: "space-y-6", children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Eye, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Recently Viewed Resources" }), _jsx("p", { className: "text-gray-500", children: "Resources you view will appear here for easy access." })] }) })] })] }));
};
export default HealthEducationModules;
