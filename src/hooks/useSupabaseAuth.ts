import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "doctor" | "nurse" | "admin" | "therapist" | "coordinator";
  license_number?: string;
  department?: string;
  emirates_id?: string;
  phone?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UseSupabaseAuthReturn {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
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
      role: "doctor" | "nurse" | "admin" | "therapist" | "coordinator";
      license_number?: string;
      department?: string;
      emirates_id?: string;
      phone?: string;
    },
  ) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ success: boolean; error?: any }>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: any }>;
  changePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: any }>;
}

const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (data.user && !error) {
      // Create user profile in database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          ...userData,
          is_active: true,
          permissions: this.getDefaultPermissions(userData.role),
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
    }

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  async changePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  getDefaultPermissions(role: string): string[] {
    const rolePermissions = {
      admin: [
        "all",
        "user_management",
        "system_config",
        "reports",
        "clinical",
        "patients",
      ],
      doctor: ["clinical", "patients", "reports", "prescriptions"],
      nurse: ["clinical", "patients", "care_plans"],
      therapist: ["clinical", "patients", "therapy_sessions"],
      coordinator: ["patients", "scheduling", "reports"],
    };
    return rolePermissions[role as keyof typeof rolePermissions] || [];
  },
};

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      role: "doctor" | "nurse" | "admin" | "therapist" | "coordinator";
      license_number?: string;
      department?: string;
      emirates_id?: string;
      phone?: string;
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      const { data, error } = await AuthService.updateUserProfile(
        user.id,
        updates,
      );

      if (error) {
        handleApiError(error, "Update profile");
        return { success: false, error };
      }

      setUserProfile(data);
      handleSuccess("Profile updated successfully");
      return { success: true };
    } catch (error) {
      handleApiError(error, "Update profile");
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await AuthService.resetPassword(email);

      if (error) {
        handleApiError(error, "Reset password");
        return { success: false, error };
      }

      handleSuccess("Password reset email sent");
      return { success: true };
    } catch (error) {
      handleApiError(error, "Reset password");
      return { success: false, error };
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await AuthService.changePassword(newPassword);

      if (error) {
        handleApiError(error, "Change password");
        return { success: false, error };
      }

      handleSuccess("Password changed successfully");
      return { success: true };
    } catch (error) {
      handleApiError(error, "Change password");
      return { success: false, error };
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile?.permissions) return false;
    return (
      userProfile.permissions.includes("all") ||
      userProfile.permissions.includes(permission)
    );
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
    updateProfile,
    hasPermission,
    isRole,
    resetPassword,
    changePassword,
  };
};
