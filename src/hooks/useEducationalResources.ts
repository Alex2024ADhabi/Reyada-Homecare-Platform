import { useState, useEffect } from "react";
import { EducationalResource } from "@/types/patient-portal";

interface UseEducationalResourcesReturn {
  resources: EducationalResource[];
  categories: string[];
  bookmarkedResources: EducationalResource[];
  recentlyViewed: EducationalResource[];
  isLoading: boolean;
  error: string | null;
  searchResources: (
    query: string,
    filters?: {
      category?: string;
      type?: string;
      difficulty?: string;
    },
  ) => Promise<EducationalResource[]>;
  markAsViewed: (resourceId: string) => Promise<void>;
  bookmarkResource: (resourceId: string) => Promise<void>;
  removeBookmark: (resourceId: string) => Promise<void>;
  rateResource: (resourceId: string, rating: number) => Promise<void>;
}

export const useEducationalResources = (
  patientId: string,
): UseEducationalResourcesReturn => {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<
    EducationalResource[]
  >([]);
  const [recentlyViewed, setRecentlyViewed] = useState<EducationalResource[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
    fetchCategories();
    fetchBookmarkedResources();
    fetchRecentlyViewed();
  }, [patientId]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/educational-resources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch educational resources");
      }

      const data = await response.json();
      setResources(data);
    } catch (err) {
      console.error("Failed to fetch educational resources:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockResources: EducationalResource[] = [
        {
          id: "edu-1",
          type: "article",
          title: "Managing Diabetes Through Diet",
          description:
            "Learn about the best foods for diabetes management and how to create a balanced meal plan.",
          content: "Comprehensive guide to diabetes nutrition...",
          category: "Nutrition",
          tags: ["diabetes", "diet", "nutrition", "meal-planning"],
          difficulty: "beginner",
          language: "en",
          personalizedFor: ["diabetes"],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
          createdAt: "2024-01-01T10:00:00Z",
          updatedAt: "2024-01-01T10:00:00Z",
        },
        {
          id: "edu-2",
          type: "video",
          title: "Blood Sugar Monitoring Techniques",
          description:
            "Step-by-step video guide on how to properly monitor your blood sugar levels at home.",
          url: "https://example.com/video/blood-sugar-monitoring",
          duration: 480, // 8 minutes
          category: "Self-Care",
          tags: ["diabetes", "monitoring", "blood-sugar", "self-care"],
          difficulty: "beginner",
          language: "en",
          personalizedFor: ["diabetes"],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
          createdAt: "2024-01-02T10:00:00Z",
          updatedAt: "2024-01-02T10:00:00Z",
        },
        {
          id: "edu-3",
          type: "infographic",
          title: "Medication Timing Chart",
          description:
            "Visual guide to help you remember when to take your medications throughout the day.",
          url: "https://example.com/infographic/medication-timing",
          category: "Medication Management",
          tags: ["medication", "timing", "schedule", "adherence"],
          difficulty: "beginner",
          language: "en",
          personalizedFor: ["medication-management"],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
          createdAt: "2024-01-03T10:00:00Z",
          updatedAt: "2024-01-03T10:00:00Z",
        },
        {
          id: "edu-4",
          type: "interactive",
          title: "Exercise Planning Tool",
          description:
            "Interactive tool to help you create a personalized exercise plan based on your health conditions.",
          url: "https://example.com/interactive/exercise-planner",
          category: "Exercise & Fitness",
          tags: ["exercise", "fitness", "planning", "health"],
          difficulty: "intermediate",
          language: "en",
          personalizedFor: ["diabetes", "hypertension"],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
          createdAt: "2024-01-04T10:00:00Z",
          updatedAt: "2024-01-04T10:00:00Z",
        },
        {
          id: "edu-5",
          type: "pdf",
          title: "Emergency Action Plan",
          description:
            "Downloadable emergency action plan template for diabetes-related emergencies.",
          url: "https://example.com/pdf/emergency-action-plan.pdf",
          category: "Emergency Preparedness",
          tags: ["emergency", "diabetes", "action-plan", "safety"],
          difficulty: "intermediate",
          language: "en",
          personalizedFor: ["diabetes"],
          thumbnailUrl:
            "https://images.unsplash.com/photo-1584467735871-8e4b8c0b1b8c?w=400&q=80",
          createdAt: "2024-01-05T10:00:00Z",
          updatedAt: "2024-01-05T10:00:00Z",
        },
      ];
      setResources(mockResources);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/educational-resources/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);

      // Mock data for development
      const mockCategories = [
        "Nutrition",
        "Self-Care",
        "Medication Management",
        "Exercise & Fitness",
        "Emergency Preparedness",
        "Mental Health",
        "Chronic Disease Management",
      ];
      setCategories(mockCategories);
    }
  };

  const fetchBookmarkedResources = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/bookmarked-resources`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarked resources");
      }

      const data = await response.json();
      setBookmarkedResources(data);
    } catch (err) {
      console.error("Failed to fetch bookmarked resources:", err);
      setBookmarkedResources([]);
    }
  };

  const fetchRecentlyViewed = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/recently-viewed-resources`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recently viewed resources");
      }

      const data = await response.json();
      setRecentlyViewed(data);
    } catch (err) {
      console.error("Failed to fetch recently viewed resources:", err);
      setRecentlyViewed([]);
    }
  };

  const searchResources = async (
    query: string,
    filters?: {
      category?: string;
      type?: string;
      difficulty?: string;
    },
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
      });

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/educational-resources/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to search resources");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Failed to search resources:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async (resourceId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/patient/${patientId}/viewed-resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({ resourceId }),
      });

      // Update recently viewed list
      const resource = resources.find((r) => r.id === resourceId);
      if (resource) {
        setRecentlyViewed((prev) => {
          const filtered = prev.filter((r) => r.id !== resourceId);
          return [resource, ...filtered].slice(0, 10); // Keep only 10 recent items
        });
      }
    } catch (err) {
      console.error("Failed to mark resource as viewed:", err);
    }
  };

  const bookmarkResource = async (resourceId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/patient/${patientId}/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({ resourceId }),
      });

      // Update bookmarked resources list
      const resource = resources.find((r) => r.id === resourceId);
      if (resource) {
        setBookmarkedResources((prev) => [resource, ...prev]);
      }
    } catch (err) {
      console.error("Failed to bookmark resource:", err);
      throw err;
    }
  };

  const removeBookmark = async (resourceId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/patient/${patientId}/bookmarks/${resourceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      // Update bookmarked resources list
      setBookmarkedResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      throw err;
    }
  };

  const rateResource = async (resourceId: string, rating: number) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/educational-resources/${resourceId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({ rating, patientId }),
      });
    } catch (err) {
      console.error("Failed to rate resource:", err);
      throw err;
    }
  };

  return {
    resources,
    categories,
    bookmarkedResources,
    recentlyViewed,
    isLoading,
    error,
    searchResources,
    markAsViewed,
    bookmarkResource,
    removeBookmark,
    rateResource,
  };
};
