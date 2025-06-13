import { useState, useEffect } from "react";
import { supabase, AuthService } from "@/api/supabase.api";
import { useErrorHandler } from "@/services/error-handler.service";
export const useSupabaseAuth = () => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { handleApiError, handleSuccess } = useErrorHandler();
    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error) {
                    console.error("Error getting session:", error);
                    return;
                }
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadUserProfile(session.user.id);
                }
            }
            catch (error) {
                console.error("Error in getInitialSession:", error);
            }
            finally {
                setLoading(false);
            }
        };
        getInitialSession();
        // Listen for auth changes
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await loadUserProfile(session.user.id);
            }
            else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    const loadUserProfile = async (userId) => {
        try {
            const { data, error } = await AuthService.getUserProfile(userId);
            if (error) {
                console.error("Error loading user profile:", error);
                return;
            }
            setUserProfile(data);
        }
        catch (error) {
            console.error("Error in loadUserProfile:", error);
        }
    };
    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const { data, error } = await AuthService.signIn(email, password);
            if (error) {
                handleApiError(error, "Sign in");
                return { success: false, error };
            }
            handleSuccess("Signed in successfully");
            return { success: true };
        }
        catch (error) {
            handleApiError(error, "Sign in");
            return { success: false, error };
        }
        finally {
            setLoading(false);
        }
    };
    const signUp = async (email, password, userData) => {
        try {
            setLoading(true);
            const { data, error } = await AuthService.signUp(email, password, userData);
            if (error) {
                handleApiError(error, "Sign up");
                return { success: false, error };
            }
            handleSuccess("Account created successfully. Please check your email for verification.");
            return { success: true };
        }
        catch (error) {
            handleApiError(error, "Sign up");
            return { success: false, error };
        }
        finally {
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
        }
        catch (error) {
            handleApiError(error, "Sign out");
        }
        finally {
            setLoading(false);
        }
    };
    const hasPermission = (permission) => {
        if (!userProfile?.permissions)
            return false;
        return userProfile.permissions.includes(permission);
    };
    const isRole = (role) => {
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
