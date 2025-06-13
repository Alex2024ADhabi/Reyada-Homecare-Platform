import { createClient } from "@supabase/supabase-js";
import { errorHandler } from "@/services/error-handler.service";
// Supabase configuration with environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
// Validate required environment variables
if (!supabaseUrl) {
    console.error("❌ VITE_SUPABASE_URL is not set. Please add it to your environment variables.");
    throw new Error("Missing VITE_SUPABASE_URL environment variable");
}
if (!supabaseAnonKey) {
    console.error("❌ VITE_SUPABASE_ANON_KEY is not set. Please add it to your environment variables.");
    throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}
// Service role key is optional but recommended for admin operations
if (!supabaseServiceRoleKey) {
    console.warn("⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations may be limited.");
}
console.log("✅ Supabase configuration validated:", {
    url: supabaseUrl.substring(0, 30) + "...",
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceRoleKey,
});
// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    global: {
        headers: {
            "X-Client-Info": "reyada-homecare-platform",
        },
    },
});
// Authentication and User Management
export class AuthService {
    // Sign up with role-based access
    static async signUp(email, password, userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: userData.full_name,
                        role: userData.role,
                        license_number: userData.license_number,
                        department: userData.department,
                    },
                },
            });
            if (error)
                throw error;
            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user.id, userData);
            }
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "AuthService.signUp"),
            };
        }
    }
    // Sign in
    static async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "AuthService.signIn"),
            };
        }
    }
    // Sign out
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
            return { error: null };
        }
        catch (error) {
            return {
                error: errorHandler.handleApiError(error, "AuthService.signOut"),
            };
        }
    }
    // Get current user
    static async getCurrentUser() {
        try {
            const { data: { user }, error, } = await supabase.auth.getUser();
            if (error)
                throw error;
            return { user, error: null };
        }
        catch (error) {
            return {
                user: null,
                error: errorHandler.handleApiError(error, "AuthService.getCurrentUser"),
            };
        }
    }
    // Get user profile with role information
    static async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "AuthService.getUserProfile"),
            };
        }
    }
    // Create user profile
    static async createUserProfile(userId, userData) {
        try {
            const { data, error } = await supabase.from("user_profiles").insert({
                id: userId,
                full_name: userData.full_name,
                role: userData.role,
                license_number: userData.license_number,
                department: userData.department,
                is_active: true,
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "AuthService.createUserProfile"),
            };
        }
    }
    // Update user profile
    static async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .update(updates)
                .eq("id", userId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "AuthService.updateUserProfile"),
            };
        }
    }
    // Check user permissions
    static async checkPermission(userId, permission) {
        try {
            const { data, error } = await supabase.rpc("check_user_permission", {
                user_id: userId,
                permission_name: permission,
            });
            if (error)
                throw error;
            return { hasPermission: data, error: null };
        }
        catch (error) {
            return {
                hasPermission: false,
                error: errorHandler.handleApiError(error, "AuthService.checkPermission"),
            };
        }
    }
}
// Patient Management Service
export class PatientService {
    // Create new patient
    static async createPatient(patientData) {
        try {
            const { data, error } = await supabase
                .from("patients")
                .insert(patientData)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "PatientService.createPatient"),
            };
        }
    }
    // Get patient by ID
    static async getPatient(patientId) {
        try {
            const { data, error } = await supabase
                .from("patients")
                .select(`
          *,
          episodes (
            id,
            episode_number,
            status,
            start_date,
            end_date,
            primary_diagnosis
          )
        `)
                .eq("id", patientId)
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "PatientService.getPatient"),
            };
        }
    }
    // Search patients
    static async searchPatients(query, filters) {
        try {
            let queryBuilder = supabase.from("patients").select(`
          id,
          emirates_id,
          first_name_en,
          last_name_en,
          date_of_birth,
          gender,
          phone_number,
          insurance_provider,
          insurance_type,
          status,
          created_at
        `);
            // Add search conditions
            if (query) {
                queryBuilder = queryBuilder.or(`first_name_en.ilike.%${query}%,last_name_en.ilike.%${query}%,emirates_id.ilike.%${query}%`);
            }
            // Add filters
            if (filters?.insurance_type) {
                queryBuilder = queryBuilder.eq("insurance_type", filters.insurance_type);
            }
            if (filters?.status) {
                queryBuilder = queryBuilder.eq("status", filters.status);
            }
            // Add limit
            queryBuilder = queryBuilder.limit(filters?.limit || 50);
            const { data, error } = await queryBuilder;
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "PatientService.searchPatients"),
            };
        }
    }
    // Update patient
    static async updatePatient(patientId, updates) {
        try {
            const { data, error } = await supabase
                .from("patients")
                .update(updates)
                .eq("id", patientId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "PatientService.updatePatient"),
            };
        }
    }
    // Get patient episodes
    static async getPatientEpisodes(patientId) {
        try {
            const { data, error } = await supabase
                .from("episodes")
                .select(`
          *,
          clinical_forms (
            id,
            form_type,
            status,
            created_at,
            updated_at
          )
        `)
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "PatientService.getPatientEpisodes"),
            };
        }
    }
}
// Episode Management Service
export class EpisodeService {
    // Create new episode
    static async createEpisode(episodeData) {
        try {
            const { data, error } = await supabase
                .from("episodes")
                .insert(episodeData)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "EpisodeService.createEpisode"),
            };
        }
    }
    // Get episode by ID
    static async getEpisode(episodeId) {
        try {
            const { data, error } = await supabase
                .from("episodes")
                .select(`
          *,
          patients (
            id,
            emirates_id,
            first_name_en,
            last_name_en,
            date_of_birth,
            gender
          ),
          clinical_forms (
            id,
            form_type,
            form_data,
            status,
            created_by,
            created_at,
            updated_at
          )
        `)
                .eq("id", episodeId)
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "EpisodeService.getEpisode"),
            };
        }
    }
    // Update episode
    static async updateEpisode(episodeId, updates) {
        try {
            const { data, error } = await supabase
                .from("episodes")
                .update(updates)
                .eq("id", episodeId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "EpisodeService.updateEpisode"),
            };
        }
    }
}
// Clinical Forms Service
export class ClinicalFormsService {
    // Create clinical form
    static async createClinicalForm(formData) {
        try {
            const { data, error } = await supabase
                .from("clinical_forms")
                .insert(formData)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "ClinicalFormsService.createClinicalForm"),
            };
        }
    }
    // Get clinical form by ID
    static async getClinicalForm(formId) {
        try {
            const { data, error } = await supabase
                .from("clinical_forms")
                .select(`
          *,
          episodes (
            id,
            episode_number,
            patients (
              id,
              first_name_en,
              last_name_en,
              emirates_id
            )
          ),
          user_profiles!clinical_forms_created_by_fkey (
            id,
            full_name,
            role,
            license_number
          )
        `)
                .eq("id", formId)
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "ClinicalFormsService.getClinicalForm"),
            };
        }
    }
    // Update clinical form
    static async updateClinicalForm(formId, updates) {
        try {
            const { data, error } = await supabase
                .from("clinical_forms")
                .update(updates)
                .eq("id", formId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "ClinicalFormsService.updateClinicalForm"),
            };
        }
    }
    // Get forms for episode
    static async getEpisodeForms(episodeId, formType) {
        try {
            let queryBuilder = supabase
                .from("clinical_forms")
                .select(`
          *,
          user_profiles!clinical_forms_created_by_fkey (
            full_name,
            role,
            license_number
          )
        `)
                .eq("episode_id", episodeId)
                .order("created_at", { ascending: false });
            if (formType) {
                queryBuilder = queryBuilder.eq("form_type", formType);
            }
            const { data, error } = await queryBuilder;
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "ClinicalFormsService.getEpisodeForms"),
            };
        }
    }
    // Submit form for DOH compliance
    static async submitForm(formId, signatureData) {
        try {
            const { data, error } = await supabase
                .from("clinical_forms")
                .update({
                status: "submitted",
                signature_data: signatureData.signature_data,
                signed_by: signatureData.signed_by,
                signed_at: signatureData.signed_at,
                submitted_at: new Date().toISOString(),
            })
                .eq("id", formId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "ClinicalFormsService.submitForm"),
            };
        }
    }
}
// Real-time Subscriptions Service
export class RealtimeService {
    // Subscribe to patient updates
    static subscribeToPatient(patientId, callback) {
        const subscription = supabase
            .channel(`patient-${patientId}`)
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "patients",
            filter: `id=eq.${patientId}`,
        }, callback)
            .subscribe();
        this.subscriptions.set(`patient-${patientId}`, subscription);
        return subscription;
    }
    // Subscribe to episode updates
    static subscribeToEpisode(episodeId, callback) {
        const subscription = supabase
            .channel(`episode-${episodeId}`)
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "episodes",
            filter: `id=eq.${episodeId}`,
        }, callback)
            .subscribe();
        this.subscriptions.set(`episode-${episodeId}`, subscription);
        return subscription;
    }
    // Subscribe to clinical forms updates
    static subscribeToClinicalForms(episodeId, callback) {
        const subscription = supabase
            .channel(`clinical-forms-${episodeId}`)
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "clinical_forms",
            filter: `episode_id=eq.${episodeId}`,
        }, callback)
            .subscribe();
        this.subscriptions.set(`clinical-forms-${episodeId}`, subscription);
        return subscription;
    }
    // Subscribe to user presence (for collaborative editing)
    static subscribeToPresence(roomId, userInfo, callback) {
        const subscription = supabase
            .channel(`presence-${roomId}`)
            .on("presence", { event: "sync" }, callback)
            .on("presence", { event: "join" }, callback)
            .on("presence", { event: "leave" }, callback)
            .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await subscription.track(userInfo);
            }
        });
        this.subscriptions.set(`presence-${roomId}`, subscription);
        return subscription;
    }
    // Unsubscribe from a channel
    static unsubscribe(key) {
        const subscription = this.subscriptions.get(key);
        if (subscription) {
            supabase.removeChannel(subscription);
            this.subscriptions.delete(key);
        }
    }
    // Unsubscribe from all channels
    static unsubscribeAll() {
        this.subscriptions.forEach((subscription, key) => {
            supabase.removeChannel(subscription);
        });
        this.subscriptions.clear();
    }
}
Object.defineProperty(RealtimeService, "subscriptions", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
// File Storage Service
export class StorageService {
    // Upload medical image/document
    static async uploadFile(bucket, path, file, options) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                cacheControl: options?.cacheControl || "3600",
                contentType: options?.contentType || file.type,
                upsert: options?.upsert || false,
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "StorageService.uploadFile"),
            };
        }
    }
    // Get file URL
    static getFileUrl(bucket, path) {
        try {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            return { url: data.publicUrl, error: null };
        }
        catch (error) {
            return {
                url: null,
                error: errorHandler.handleApiError(error, "StorageService.getFileUrl"),
            };
        }
    }
    // Delete file
    static async deleteFile(bucket, paths) {
        try {
            const { data, error } = await supabase.storage.from(bucket).remove(paths);
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "StorageService.deleteFile"),
            };
        }
    }
    // Create signed URL for secure access
    static async createSignedUrl(bucket, path, expiresIn = 3600) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(path, expiresIn);
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "StorageService.createSignedUrl"),
            };
        }
    }
}
// Database utility functions
export const dbUtils = {
    // Check if user has access to patient
    async checkPatientAccess(userId, patientId) {
        try {
            const { data, error } = await supabase.rpc("check_patient_access", {
                user_id: userId,
                patient_id: patientId,
            });
            if (error)
                throw error;
            return { hasAccess: data, error: null };
        }
        catch (error) {
            return {
                hasAccess: false,
                error: errorHandler.handleApiError(error, "dbUtils.checkPatientAccess"),
            };
        }
    },
    // Get user permissions
    async getUserPermissions(userId) {
        try {
            const { data, error } = await supabase.rpc("get_user_permissions", {
                user_id: userId,
            });
            if (error)
                throw error;
            return { permissions: data, error: null };
        }
        catch (error) {
            return {
                permissions: [],
                error: errorHandler.handleApiError(error, "dbUtils.getUserPermissions"),
            };
        }
    },
    // Audit log function
    async createAuditLog(action, table_name, record_id, old_values, new_values) {
        try {
            const { data, error } = await supabase.from("audit_logs").insert({
                action,
                table_name,
                record_id,
                old_values,
                new_values,
                created_at: new Date().toISOString(),
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: errorHandler.handleApiError(error, "dbUtils.createAuditLog"),
            };
        }
    },
};
export default supabase;
