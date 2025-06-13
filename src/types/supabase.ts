export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values: Json | null;
          new_values: Json | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_forms: {
        Row: {
          id: string;
          episode_id: string;
          form_type: string;
          form_data: Json;
          status: string;
          signature_data: string | null;
          signed_by: string | null;
          signed_at: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          form_type: string;
          form_data: Json;
          status?: string;
          signature_data?: string | null;
          signed_by?: string | null;
          signed_at?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          form_type?: string;
          form_data?: Json;
          status?: string;
          signature_data?: string | null;
          signed_by?: string | null;
          signed_at?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_forms_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_forms_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_forms_signed_by_fkey";
            columns: ["signed_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      episodes: {
        Row: {
          id: string;
          patient_id: string;
          episode_number: string;
          status: string;
          start_date: string;
          end_date: string | null;
          primary_diagnosis: string | null;
          secondary_diagnoses: string[] | null;
          physician_orders: Json | null;
          care_plan: Json | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          episode_number: string;
          status?: string;
          start_date: string;
          end_date?: string | null;
          primary_diagnosis?: string | null;
          secondary_diagnoses?: string[] | null;
          physician_orders?: Json | null;
          care_plan?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          episode_number?: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          primary_diagnosis?: string | null;
          secondary_diagnoses?: string[] | null;
          physician_orders?: Json | null;
          care_plan?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "episodes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "episodes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          id: string;
          emirates_id: string;
          first_name_en: string;
          last_name_en: string;
          first_name_ar: string | null;
          last_name_ar: string | null;
          date_of_birth: string;
          gender: string;
          nationality: string;
          phone_number: string;
          email: string | null;
          address: Json | null;
          insurance_provider: string | null;
          insurance_type: string | null;
          insurance_number: string | null;
          thiqa_card_number: string | null;
          medical_record_number: string | null;
          blood_type: string | null;
          allergies: string[] | null;
          chronic_conditions: string[] | null;
          current_medications: Json | null;
          emergency_contacts: Json | null;
          language_preference: string | null;
          interpreter_required: boolean | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          emirates_id: string;
          first_name_en: string;
          last_name_en: string;
          first_name_ar?: string | null;
          last_name_ar?: string | null;
          date_of_birth: string;
          gender: string;
          nationality: string;
          phone_number: string;
          email?: string | null;
          address?: Json | null;
          insurance_provider?: string | null;
          insurance_type?: string | null;
          insurance_number?: string | null;
          thiqa_card_number?: string | null;
          medical_record_number?: string | null;
          blood_type?: string | null;
          allergies?: string[] | null;
          chronic_conditions?: string[] | null;
          current_medications?: Json | null;
          emergency_contacts?: Json | null;
          language_preference?: string | null;
          interpreter_required?: boolean | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          emirates_id?: string;
          first_name_en?: string;
          last_name_en?: string;
          first_name_ar?: string | null;
          last_name_ar?: string | null;
          date_of_birth?: string;
          gender?: string;
          nationality?: string;
          phone_number?: string;
          email?: string | null;
          address?: Json | null;
          insurance_provider?: string | null;
          insurance_type?: string | null;
          insurance_number?: string | null;
          thiqa_card_number?: string | null;
          medical_record_number?: string | null;
          blood_type?: string | null;
          allergies?: string[] | null;
          chronic_conditions?: string[] | null;
          current_medications?: Json | null;
          emergency_contacts?: Json | null;
          language_preference?: string | null;
          interpreter_required?: boolean | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          license_number: string | null;
          department: string | null;
          is_active: boolean;
          permissions: string[] | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: string;
          license_number?: string | null;
          department?: string | null;
          is_active?: boolean;
          permissions?: string[] | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          license_number?: string | null;
          department?: string | null;
          is_active?: boolean;
          permissions?: string[] | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_patient_access: {
        Args: {
          user_id: string;
          patient_id: string;
        };
        Returns: boolean;
      };
      check_user_permission: {
        Args: {
          user_id: string;
          permission_name: string;
        };
        Returns: boolean;
      };
      get_user_permissions: {
        Args: {
          user_id: string;
        };
        Returns: string[];
      };
    };
    Enums: {
      user_role: "doctor" | "nurse" | "admin" | "therapist";
      patient_status: "active" | "inactive" | "discharged";
      episode_status: "active" | "completed" | "cancelled";
      form_status: "draft" | "completed" | "submitted" | "approved";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
