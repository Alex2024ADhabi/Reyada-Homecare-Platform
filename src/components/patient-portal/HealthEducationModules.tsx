import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Play,
  FileText,
  Image,
  Download,
  Search,
  Filter,
  Clock,
  Star,
  CheckCircle,
  Eye,
  Bookmark,
  Share,
} from "lucide-react";
import { EducationalResource } from "@/types/patient-portal";
import { useEducationalResources } from "@/hooks/useEducationalResources";
import { format } from "date-fns";

interface HealthEducationModulesProps {
  patientId: string;
  recommendations: EducationalResource[];
  className?: string;
}

export const HealthEducationModules: React.FC<HealthEducationModulesProps> = ({
  patientId,
  recommendations,
  className = "",
}) => {
  const {
    resources,
    categories,
    isLoading,
    searchResources,
    markAsViewed,
    bookmarkResource,
    removeBookmark,
  } = useEducationalResources(patientId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("recommended");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "infographic":
        return <Image className="h-4 w-4" />;
      case "pdf":
        return <Download className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
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

  const handleResourceClick = async (resource: EducationalResource) => {
    try {
      await markAsViewed(resource.id);
      if (resource.url) {
        window.open(resource.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to mark resource as viewed:", error);
    }
  };

  const handleBookmark = async (resourceId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await removeBookmark(resourceId);
      } else {
        await bookmarkResource(resourceId);
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const ResourceCard = ({
    resource,
    isRecommended = false,
  }: {
    resource: EducationalResource;
    isRecommended?: boolean;
  }) => (
    <Card key={resource.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon(resource.type)}
            <Badge className={getDifficultyColor(resource.difficulty)}>
              {resource.difficulty}
            </Badge>
            {isRecommended && (
              <Badge className="bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBookmark(resource.id, false)} // TODO: Check if bookmarked
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        {resource.thumbnailUrl && (
          <div className="mb-3">
            <img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {resource.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="capitalize">{resource.category}</span>
          {resource.duration && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{Math.ceil(resource.duration / 60)} min</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{resource.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => handleResourceClick(resource)}
            className="flex-1 mr-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            {resource.type === "video" ? "Watch" : "Read"}
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Education</h2>
          <p className="text-gray-600 mt-1">
            Personalized health information and educational resources
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="infographic">Infographics</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isRecommended
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-500">
                We'll provide personalized recommendations based on your care
                plan and health goals.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Resources Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-6">
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Bookmarked Resources
            </h3>
            <p className="text-gray-500">
              Bookmark resources you want to save for later by clicking the
              bookmark icon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Recently Viewed Resources
            </h3>
            <p className="text-gray-500">
              Resources you view will appear here for easy access.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthEducationModules;
