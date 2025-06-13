import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, AuthService } from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";

export interface UseSupabaseAuthReturn {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: any }>;
  signUp: (
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: "doctor" | "nurse" | "admin" | "therapist";
      license_number?: string;
      department?: string;
    },
  ) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
}

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { handleApiError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await AuthService.getUserProfile(userId);

      if (error) {
        console.error("Error loading user profile:", error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signIn(email, password);

      if (error) {
        handleApiError(error, "Sign in");
        return { success: false, error };
      }

      handleSuccess("Signed in successfully");
      return { success: true };
    } catch (error) {
      handleApiError(error, "Sign in");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: "doctor" | "nurse" | "admin" | "therapist";
      license_number?: string;
      department?: string;
    },
  ) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signUp(
        email,
        password,
        userData,
      );

      if (error) {
        handleApiError(error, "Sign up");
        return { success: false, error };
      }

      handleSuccess(
        "Account created successfully. Please check your email for verification.",
      );
      return { success: true };
    } catch (error) {
      handleApiError(error, "Sign up");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await AuthService.signOut();

      if (error) {
        handleApiError(error, "Sign out");
        return;
      }

      handleSuccess("Signed out successfully");
    } catch (error) {
      handleApiError(error, "Sign out");
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile?.permissions) return false;
    return userProfile.permissions.includes(permission);
  };

  const isRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isRole,
  };
};
