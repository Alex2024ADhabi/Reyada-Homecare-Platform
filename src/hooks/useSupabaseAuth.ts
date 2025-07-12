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
  ) => Promise<{ success: boolean; user?: User; error?: any }>;
  signInWithSSO: (
    provider: string,
  ) => Promise<{
    success: boolean;
    user?: User;
    session?: Session;
    error?: any;
  }>;
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
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<{ success: boolean; error?: any }>;
  getUnifiedContext: () => Promise<any>;
}

const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signInWithSSO(provider: string) {
    try {
      // Map provider names to Supabase provider types
      const providerMap: Record<string, any> = {
        google: "google",
        microsoft: "azure",
        github: "github",
      };

      const supabaseProvider = providerMap[provider];
      if (!supabaseProvider) {
        throw new Error(`Unsupported SSO provider: ${provider}`);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes:
            provider === "google"
              ? "openid email profile"
              : provider === "microsoft"
                ? "openid email profile User.Read"
                : "user:email",
        },
      });

      return { data, error };
    } catch (error) {
      console.error(`SSO sign in error for ${provider}:`, error);
      return { data: null, error };
    }
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
      return { success: true, user: data.user };
    } catch (error) {
      handleApiError(error, "Sign in");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithSSO = async (provider: string) => {
    try {
      setLoading(true);
      const { data, error } = await AuthService.signInWithSSO(provider);

      if (error) {
        handleApiError(error, `SSO sign in with ${provider}`);
        return { success: false, error };
      }

      // For OAuth, the actual sign-in happens via redirect
      // The success will be handled in the callback
      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }

      // If we get user data directly (shouldn't happen with OAuth)
      if (data?.user) {
        handleSuccess(`Signed in successfully with ${provider}`);
        return { success: true, user: data.user, session: data.session };
      }

      return { success: false, error: "No redirect URL provided" };
    } catch (error) {
      handleApiError(error, `SSO sign in with ${provider}`);
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

  const validateSession = async (): Promise<boolean> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return false;
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        return false;
      }

      // Validate unified security context
      const unifiedContext = await getUnifiedContext();
      if (!unifiedContext) {
        return false;
      }

      // Check session timeout based on last activity
      const metadata = JSON.parse(
        localStorage.getItem("auth_metadata") || "{}",
      );
      if (metadata.lastActivity) {
        const lastActivity = new Date(metadata.lastActivity);
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes
        if (Date.now() - lastActivity.getTime() > sessionTimeout) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        handleApiError(error, "Refresh session");
        return { success: false, error };
      }

      // Update unified security context with new session
      if (data.session && data.user) {
        const metadata = JSON.parse(
          localStorage.getItem("auth_metadata") || "{}",
        );
        metadata.lastActivity = new Date().toISOString();
        localStorage.setItem("auth_metadata", JSON.stringify(metadata));
      }

      return { success: true };
    } catch (error) {
      handleApiError(error, "Refresh session");
      return { success: false, error };
    }
  };

  const getUnifiedContext = async (): Promise<any> => {
    try {
      const contextData = sessionStorage.getItem("unified_security_context");
      if (!contextData) {
        return null;
      }

      const { encrypted, keyId, algorithm } = JSON.parse(contextData);

      // In a real implementation, you would decrypt the context here
      // For now, we'll return the metadata from localStorage
      const metadata = JSON.parse(
        localStorage.getItem("auth_metadata") || "{}",
      );
      return metadata;
    } catch (error) {
      console.error("Error retrieving unified context:", error);
      return null;
    }
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signInWithSSO,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    isRole,
    resetPassword,
    changePassword,
    validateSession,
    refreshSession,
    getUnifiedContext,
  };
};
