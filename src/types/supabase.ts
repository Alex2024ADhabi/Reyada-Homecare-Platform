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
      rounds_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          frequency_days: number | null;
          mandatory_fields: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          frequency_days?: number | null;
          mandatory_fields?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          frequency_days?: number | null;
          mandatory_fields?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scheduled_rounds: {
        Row: {
          id: string;
          round_type_id: string | null;
          patient_id: string;
          home_healthcare_provider_id: string;
          assigned_staff_id: string;
          scheduled_date: string;
          status: string;
          priority: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          round_type_id?: string | null;
          patient_id: string;
          home_healthcare_provider_id: string;
          assigned_staff_id: string;
          scheduled_date: string;
          status?: string;
          priority?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          round_type_id?: string | null;
          patient_id?: string;
          home_healthcare_provider_id?: string;
          assigned_staff_id?: string;
          scheduled_date?: string;
          status?: string;
          priority?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_rounds_round_type_id_fkey";
            columns: ["round_type_id"];
            isOneToOne: false;
            referencedRelation: "rounds_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_rounds_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_rounds_assigned_staff_id_fkey";
            columns: ["assigned_staff_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      round_assessments: {
        Row: {
          id: string;
          scheduled_round_id: string | null;
          assessor_id: string;
          start_time: string;
          end_time: string | null;
          location_coordinates: string | null;
          assessment_data: Json;
          photos: Json | null;
          overall_score: number | null;
          status: string;
          digital_signature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scheduled_round_id?: string | null;
          assessor_id: string;
          start_time?: string;
          end_time?: string | null;
          location_coordinates?: string | null;
          assessment_data: Json;
          photos?: Json | null;
          overall_score?: number | null;
          status?: string;
          digital_signature?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scheduled_round_id?: string | null;
          assessor_id?: string;
          start_time?: string;
          end_time?: string | null;
          location_coordinates?: string | null;
          assessment_data?: Json;
          photos?: Json | null;
          overall_score?: number | null;
          status?: string;
          digital_signature?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "round_assessments_scheduled_round_id_fkey";
            columns: ["scheduled_round_id"];
            isOneToOne: false;
            referencedRelation: "scheduled_rounds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_assessments_assessor_id_fkey";
            columns: ["assessor_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quality_indicators: {
        Row: {
          id: string;
          round_assessment_id: string | null;
          indicator_type: string;
          indicator_value: Json;
          compliance_status: string | null;
          action_required: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_assessment_id?: string | null;
          indicator_type: string;
          indicator_value: Json;
          compliance_status?: string | null;
          action_required?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_assessment_id?: string | null;
          indicator_type?: string;
          indicator_value?: Json;
          compliance_status?: string | null;
          action_required?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quality_indicators_round_assessment_id_fkey";
            columns: ["round_assessment_id"];
            isOneToOne: false;
            referencedRelation: "round_assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      round_schedules: {
        Row: {
          id: string;
          round_type: string;
          patient_id: string;
          episode_id: string;
          supervisor_id: string;
          assigned_assessor_id: string;
          scheduled_date: string;
          scheduled_time: string;
          status: string;
          priority: string;
          estimated_duration: number;
          location_data: Json;
          notifications: Json;
          acceptance_deadline: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          round_type: string;
          patient_id: string;
          episode_id: string;
          supervisor_id: string;
          assigned_assessor_id: string;
          scheduled_date: string;
          scheduled_time: string;
          status?: string;
          priority?: string;
          estimated_duration: number;
          location_data: Json;
          notifications?: Json;
          acceptance_deadline: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          round_type?: string;
          patient_id?: string;
          episode_id?: string;
          supervisor_id?: string;
          assigned_assessor_id?: string;
          scheduled_date?: string;
          scheduled_time?: string;
          status?: string;
          priority?: string;
          estimated_duration?: number;
          location_data?: Json;
          notifications?: Json;
          acceptance_deadline?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "round_schedules_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_schedules_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_schedules_supervisor_id_fkey";
            columns: ["supervisor_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_schedules_assigned_assessor_id_fkey";
            columns: ["assigned_assessor_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_executions: {
        Row: {
          id: string;
          schedule_id: string;
          assessor_id: string;
          patient_id: string;
          episode_id: string;
          workflow_data: Json;
          compliance_data: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          assessor_id: string;
          patient_id: string;
          episode_id: string;
          workflow_data: Json;
          compliance_data: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          assessor_id?: string;
          patient_id?: string;
          episode_id?: string;
          workflow_data?: Json;
          compliance_data?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_executions_schedule_id_fkey";
            columns: ["schedule_id"];
            isOneToOne: false;
            referencedRelation: "round_schedules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_executions_assessor_id_fkey";
            columns: ["assessor_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_executions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_executions_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
        ];
      };
      round_action_items: {
        Row: {
          id: string;
          round_assessment_id: string | null;
          priority: string;
          category: string;
          description: string;
          assigned_to: string | null;
          due_date: string | null;
          status: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_assessment_id?: string | null;
          priority: string;
          category: string;
          description: string;
          assigned_to?: string | null;
          due_date?: string | null;
          status?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_assessment_id?: string | null;
          priority?: string;
          category?: string;
          description?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          status?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "round_action_items_round_assessment_id_fkey";
            columns: ["round_assessment_id"];
            isOneToOne: false;
            referencedRelation: "round_assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "round_action_items_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      form_templates: {
        Row: {
          id: string;
          round_type_id: string | null;
          template_name: string;
          version: string;
          form_schema: Json;
          validation_rules: Json | null;
          scoring_criteria: Json | null;
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          round_type_id?: string | null;
          template_name: string;
          version: string;
          form_schema: Json;
          validation_rules?: Json | null;
          scoring_criteria?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          round_type_id?: string | null;
          template_name?: string;
          version?: string;
          form_schema?: Json;
          validation_rules?: Json | null;
          scoring_criteria?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_templates_round_type_id_fkey";
            columns: ["round_type_id"];
            isOneToOne: false;
            referencedRelation: "rounds_types";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_paths: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          target_role: string;
          competency_level: string;
          estimated_duration: number;
          prerequisites: string[] | null;
          modules: Json;
          assessments: Json;
          certification_config: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          target_role: string;
          competency_level: string;
          estimated_duration: number;
          prerequisites?: string[] | null;
          modules: Json;
          assessments: Json;
          certification_config?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          target_role?: string;
          competency_level?: string;
          estimated_duration?: number;
          prerequisites?: string[] | null;
          modules?: Json;
          assessments?: Json;
          certification_config?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_paths_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_learning_progress: {
        Row: {
          id: string;
          user_id: string;
          learning_path_id: string;
          current_module_id: string | null;
          completed_modules: string[];
          overall_progress: number;
          time_spent: number;
          status: string;
          started_at: string;
          completed_at: string | null;
          last_accessed: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          learning_path_id: string;
          current_module_id?: string | null;
          completed_modules?: string[];
          overall_progress?: number;
          time_spent?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          last_accessed?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          learning_path_id?: string;
          current_module_id?: string | null;
          completed_modules?: string[];
          overall_progress?: number;
          time_spent?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          last_accessed?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_learning_progress_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
            referencedColumns: ["id"];
          },
        ];
      };
      unified_certifications: {
        Row: {
          id: string;
          user_id: string;
          learning_path_id: string | null;
          module_id: string | null;
          certification_type: string;
          title: string;
          issued_date: string;
          expiry_date: string;
          status: string;
          competencies: string[];
          assessment_scores: Json;
          digital_signature: string | null;
          verification_code: string;
          cpd_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          certification_type: string;
          title: string;
          issued_date: string;
          expiry_date: string;
          status?: string;
          competencies: string[];
          assessment_scores: Json;
          digital_signature?: string | null;
          verification_code: string;
          cpd_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          learning_path_id?: string | null;
          module_id?: string | null;
          certification_type?: string;
          title?: string;
          issued_date?: string;
          expiry_date?: string;
          status?: string;
          competencies?: string[];
          assessment_scores?: Json;
          digital_signature?: string | null;
          verification_code?: string;
          cpd_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "unified_certifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unified_certifications_learning_path_id_fkey";
            columns: ["learning_path_id"];
            isOneToOne: false;
            referencedRelation: "learning_paths";
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
      round_status: "scheduled" | "in_progress" | "completed" | "cancelled";
      round_priority: "low" | "normal" | "high" | "urgent";
      assessment_status: "in_progress" | "completed" | "reviewed" | "approved";
      action_item_status: "open" | "in_progress" | "completed" | "cancelled";
      action_item_priority: "low" | "medium" | "high" | "critical";
      compliance_status:
        | "compliant"
        | "non_compliant"
        | "partial"
        | "not_applicable";
      schedule_status:
        | "pending"
        | "accepted"
        | "declined"
        | "confirmed"
        | "reassigned"
        | "completed";
      execution_status: "scheduled" | "in_progress" | "completed" | "cancelled";
      workflow_step:
        | "arrival"
        | "gps_verification"
        | "patient_verification"
        | "assessment"
        | "review"
        | "signature"
        | "submission";
    };
  };
};

// EMR Integration Types
export interface EMRPatientData {
  id: string;
  emrId: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    emiratesId: string;
    phoneNumber: string;
    email?: string;
    address: {
      street: string;
      city: string;
      emirate: string;
      postalCode: string;
    };
  };
  medicalHistory: {
    chronicConditions: string[];
    surgicalHistory: Array<{
      procedure: string;
      date: string;
      hospital: string;
    }>;
    familyHistory: Array<{
      relation: string;
      condition: string;
    }>;
    socialHistory: {
      smoking: boolean;
      alcohol: boolean;
      occupation: string;
    };
  };
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
    status: "active" | "discontinued" | "completed";
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: "mild" | "moderate" | "severe";
    onsetDate: string;
  }>;
  vitalSigns: Array<{
    date: string;
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  }>;
  lastSyncTime: string;
  syncStatus: "synced" | "pending" | "error" | "conflict";
}

export interface EMRCarePlan {
  id: string;
  patientId: string;
  episodeId: string;
  version: number;
  status: "active" | "completed" | "cancelled" | "suspended";
  period: {
    start: string;
    end?: string;
  };
  goals: Array<{
    id: string;
    description: string;
    category: string;
    priority: "high" | "medium" | "low";
    targetDate: string;
    status: "active" | "achieved" | "discontinued" | "on-hold";
    progress: {
      percentage: number;
      lastUpdated: string;
      notes: string;
    };
    outcomes: Array<{
      measure: string;
      target: string;
      current: string;
      unit: string;
    }>;
  }>;
  interventions: Array<{
    id: string;
    type: string;
    category: string;
    description: string;
    instructions: string;
    frequency: string;
    duration?: string;
    startDate: string;
    endDate?: string;
    assignedTo: {
      id: string;
      name: string;
      role: string;
    };
    status: "active" | "completed" | "discontinued" | "on-hold";
    progress: {
      completedSessions: number;
      totalSessions: number;
      lastSession: string;
      notes: string;
    };
  }>;
  assessments: Array<{
    id: string;
    type: string;
    scheduledDate: string;
    completedDate?: string;
    assessor: {
      id: string;
      name: string;
      role: string;
    };
    status: "scheduled" | "completed" | "cancelled";
    results?: any;
  }>;
  careTeam: Array<{
    id: string;
    name: string;
    role: string;
    specialty?: string;
    contactInfo: {
      phone: string;
      email: string;
    };
    responsibilities: string[];
  }>;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  lastUpdated: string;
  lastUpdatedBy: {
    id: string;
    name: string;
    role: string;
  };
  emrSyncStatus: "synced" | "pending" | "error";
  emrSyncTime?: string;
}

export interface EMRAssessmentIntegration {
  id: string;
  assessmentId: string;
  patientId: string;
  episodeId: string;
  emrRecordId?: string;
  assessmentType: "quality" | "infection-control" | "clinical" | "physician";
  completedDate: string;
  assessor: {
    id: string;
    name: string;
    role: string;
    licenseNumber?: string;
  };
  clinicalFindings: {
    primaryFindings: string[];
    secondaryFindings: string[];
    abnormalFindings: string[];
    clinicalImpression: string;
  };
  functionalAssessment: {
    adlScore: number;
    mobilityLevel: string;
    cognitiveStatus: string;
    communicationAbility: string;
  };
  psychosocialAssessment: {
    moodAssessment: string;
    socialSupport: string;
    copingMechanisms: string[];
    riskFactors: string[];
  };
  environmentalAssessment: {
    homeEnvironment: string;
    safetyHazards: string[];
    accessibilityIssues: string[];
    equipmentNeeds: string[];
  };
  measurements: {
    vitalSigns?: {
      bloodPressure?: { systolic: number; diastolic: number };
      heartRate?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      painLevel?: number;
    };
    anthropometrics?: {
      weight?: number;
      height?: number;
      bmi?: number;
    };
    laboratorResults?: Array<{
      test: string;
      value: string;
      unit: string;
      referenceRange: string;
      status: "normal" | "abnormal" | "critical";
    }>;
    diagnosticResults?: Array<{
      type: string;
      result: string;
      interpretation: string;
      date: string;
    }>;
  };
  actionItems: Array<{
    id: string;
    priority: "low" | "medium" | "high" | "critical";
    category: string;
    description: string;
    assignedTo: {
      id: string;
      name: string;
      role: string;
    };
    dueDate: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    resolution?: {
      completedDate: string;
      completedBy: string;
      notes: string;
    };
  }>;
  complianceData: {
    dohStandards: {
      standard: string;
      sections: string[];
      complianceScore: number;
      nonCompliantItems: Array<{
        item: string;
        severity: "low" | "medium" | "high";
        recommendation: string;
      }>;
    };
    jawdaIndicators: Array<{
      category: string;
      indicator: string;
      value: number;
      target: number;
      status: "met" | "not_met" | "exceeded";
    }>;
  };
  qualityMetrics: {
    patientSatisfaction: {
      score: number;
      maxScore: number;
      feedback: string;
    };
    careQuality: {
      score: number;
      maxScore: number;
      domains: Array<{
        domain: string;
        score: number;
        maxScore: number;
      }>;
    };
    safetyScore: {
      score: number;
      maxScore: number;
      riskFactors: string[];
    };
    outcomesMet: {
      achieved: number;
      total: number;
      percentage: number;
    };
  };
  digitalSignature: {
    signed: boolean;
    signedAt?: string;
    signedBy?: {
      id: string;
      name: string;
      role: string;
    };
    signatureData?: string;
  };
  attachments: Array<{
    id: string;
    type: "photo" | "document" | "audio" | "video";
    filename: string;
    description: string;
    uploadedAt: string;
    size: number;
    url: string;
  }>;
  integrationStatus: {
    emrSynced: boolean;
    emrSyncTime?: string;
    emrRecordId?: string;
    syncErrors?: string[];
    lastSyncAttempt?: string;
  };
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface EMRSyncConflict {
  id: string;
  patientId: string;
  conflictType:
    | "data_mismatch"
    | "version_conflict"
    | "missing_record"
    | "duplicate_record";
  section: string;
  field: string;
  localValue: any;
  emrValue: any;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "resolved" | "ignored";
  resolution?: {
    strategy: "use_local" | "use_emr" | "merge" | "manual";
    resolvedBy: string;
    resolvedAt: string;
    notes: string;
  };
  autoResolvable: boolean;
  impactAssessment: {
    affectedSystems: string[];
    riskLevel: "low" | "medium" | "high";
    recommendedAction: string;
  };
}

// Healthcare Integration Types
export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: "Patient";
  identifier?: Array<{
    use?: string;
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    system?: string;
    value?: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    text?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  communication?: Array<{
    language?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    preferred?: boolean;
  }>;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: "Observation";
  status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  code: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  interpretation?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: {
      value?: number;
      unit?: string;
    };
    high?: {
      value?: number;
      unit?: string;
    };
    text?: string;
  }>;
}

export interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  orderDate: string;
  collectionDate: string;
  resultDate: string;
  status: "pending" | "in-progress" | "final" | "cancelled";
  laboratory: {
    name: string;
    license: string;
    accreditation: string;
    contact: string;
  };
  results: Array<{
    parameter: string;
    value: number | string;
    unit: string;
    referenceRange: string;
    status: "normal" | "high" | "low" | "critical";
    loincCode: string;
  }>;
  clinician: {
    name: string;
    license: string;
    signature: string;
  };
  criticalValues: string[];
  comments?: string;
}

export interface MedicationData {
  patientId: string;
  currentMedications: Array<{
    id: string;
    name: string;
    genericName: string;
    strength: string;
    dosageForm: string;
    route: string;
    frequency: string;
    quantity: number;
    daysSupply: number;
    prescribedDate: string;
    lastDispensed: string;
    nextRefillDate: string;
    remainingRefills: number;
    prescriber: {
      name: string;
      license: string;
      npi: string;
    };
    pharmacy: {
      name: string;
      license: string;
      address: string;
      phone: string;
    };
    status: "active" | "inactive" | "discontinued";
    adherence: {
      score: number;
      lastTaken: string;
      missedDoses: number;
    };
  }>;
  medicationHistory: Array<{
    id: string;
    name: string;
    strength: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: "Mild" | "Moderate" | "Severe";
    onsetDate: string;
  }>;
  interactions: Array<{
    medications: string[];
    severity: "Minor" | "Moderate" | "Major";
    description: string;
    recommendation: string;
  }>;
  adherenceScore: number;
  lastPharmacyVisit: string;
  nextScheduledRefill: string;
}

export interface HospitalAdmission {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  hospital: {
    name: string;
    license: string;
    address: string;
    phone: string;
  };
  department: string;
  admissionType: "Emergency" | "Elective" | "Urgent";
  primaryDiagnosis: {
    code: string;
    description: string;
    system: "ICD-10" | "ICD-11" | "SNOMED-CT";
  };
  secondaryDiagnoses: Array<{
    code: string;
    description: string;
    system: "ICD-10" | "ICD-11" | "SNOMED-CT";
  }>;
  attendingPhysician: {
    name: string;
    license: string;
    department: string;
  };
  procedures: Array<{
    code: string;
    description: string;
    date: string;
    system: "CPT" | "ICD-10-PCS";
  }>;
  dischargeInstructions?: {
    medications: string[];
    followUp: string[];
    dietaryRestrictions: string[];
    activityLevel: string;
  };
  transitionToCare?: {
    homecareReferral: boolean;
    referralDate: string;
    services: string[];
    duration: string;
  };
}

export interface TelehealthSession {
  id: string;
  patientId: string;
  providerId: string;
  appointmentType: string;
  scheduledTime: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  platform: {
    name: string;
    version: string;
    features: string[];
  };
  sessionDetails: {
    meetingId: string;
    joinUrl: string;
    dialInNumber: string;
    accessCode: string;
    waitingRoom: boolean;
    recordingEnabled: boolean;
    encryptionEnabled: boolean;
  };
  participants: Array<{
    id: string;
    role: "patient" | "provider" | "observer";
    name: string;
    joinStatus: "pending" | "joined" | "left";
  }>;
  technicalRequirements: {
    minimumBandwidth: string;
    supportedBrowsers: string[];
    mobileApp: string;
    systemCheck: string;
  };
  clinicalFeatures: {
    vitalSigns: {
      enabled: boolean;
      devices: string[];
    };
    digitalStethoscope: boolean;
    skinExamination: boolean;
    mentalHealthAssessment: boolean;
    prescriptionManagement: boolean;
  };
  compliance: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    dohApproved: boolean;
    encryptionStandard: string;
    auditLogging: boolean;
  };
  notifications: {
    reminderSent: boolean;
    confirmationRequired: boolean;
    followUpScheduled: boolean;
  };
  createdAt: string;
}

export interface FHIRBundle extends FHIRResource {
  resourceType: "Bundle";
  type:
    | "document"
    | "message"
    | "transaction"
    | "transaction-response"
    | "batch"
    | "batch-response"
    | "history"
    | "searchset"
    | "collection";
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource?: FHIRResource;
  }>;
}

// Integration Response Types
export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  integration?: {
    [key: string]: boolean | string | number;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface HealthcareIntegrationStatus {
  fhir: {
    enabled: boolean;
    version: string;
    lastSync: string;
    status: "connected" | "disconnected" | "error";
  };
  malaffi: {
    enabled: boolean;
    version: string;
    lastSync: string;
    status: "connected" | "disconnected" | "error";
    complianceLevel: "full" | "partial" | "none";
  };
  laboratory: {
    enabled: boolean;
    connectedLabs: string[];
    lastSync: string;
    status: "connected" | "disconnected" | "error";
  };
  pharmacy: {
    enabled: boolean;
    connectedPharmacies: string[];
    lastSync: string;
    status: "connected" | "disconnected" | "error";
  };
  hospital: {
    enabled: boolean;
    connectedHospitals: string[];
    lastSync: string;
    status: "connected" | "disconnected" | "error";
  };
  telehealth: {
    enabled: boolean;
    platform: string;
    lastSession: string;
    status: "connected" | "disconnected" | "error";
  };
  insurance: {
    enabled: boolean;
    connectedProviders: string[];
    lastSync: string;
    status: "connected" | "disconnected" | "error";
  };
}

// Malaffi Integration Types
export interface MalaffiPatientRecord {
  id: string;
  malaffiId: string;
  patientId: string;
  episodeId: string;
  healthInformationExchange: {
    consentStatus: "granted" | "denied" | "pending" | "expired";
    consentDate: string;
    consentExpiry?: string;
    dataSharing: {
      demographics: boolean;
      medicalHistory: boolean;
      medications: boolean;
      allergies: boolean;
      labResults: boolean;
      imaging: boolean;
      clinicalNotes: boolean;
    };
    accessLog: Array<{
      accessedBy: string;
      accessTime: string;
      dataType: string;
      purpose: string;
      authorized: boolean;
    }>;
  };
  dataProtocols: {
    encryptionLevel: "AES-256" | "AES-128";
    transmissionProtocol: "HL7-FHIR" | "HL7-V2" | "DICOM";
    auditTrail: boolean;
    dataRetention: {
      period: number; // in days
      autoDelete: boolean;
      archivePolicy: string;
    };
  };
  synchronizationStatus: {
    lastSync: string;
    syncStatus: "synced" | "pending" | "error" | "conflict";
    pendingUpdates: Array<{
      field: string;
      localValue: any;
      malaffiValue: any;
      timestamp: string;
    }>;
    conflicts: Array<{
      field: string;
      conflictType: "data_mismatch" | "version_conflict";
      resolution: "manual" | "auto_local" | "auto_malaffi";
      resolvedAt?: string;
    }>;
  };
  complianceData: {
    dohCompliance: boolean;
    gdprCompliance: boolean;
    hipaCompliance: boolean;
    localRegulations: string[];
    auditScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MalaffiDataSharingProtocol {
  id: string;
  protocolName: string;
  version: string;
  dataTypes: Array<{
    type: string;
    format: "HL7-FHIR" | "HL7-V2" | "JSON" | "XML";
    encryption: boolean;
    compression: boolean;
    validation: {
      schema: string;
      required: boolean;
      customRules: string[];
    };
  }>;
  transmissionRules: {
    frequency: "real-time" | "hourly" | "daily" | "weekly" | "on-demand";
    batchSize: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: "linear" | "exponential";
      timeout: number;
    };
    errorHandling: {
      logErrors: boolean;
      notifyOnFailure: boolean;
      fallbackProtocol?: string;
    };
  };
  securityProtocols: {
    authentication: "oauth2" | "jwt" | "api-key" | "certificate";
    authorization: {
      roleBasedAccess: boolean;
      permissionLevels: string[];
      dataClassification: string[];
    };
    auditRequirements: {
      logAllAccess: boolean;
      retentionPeriod: number;
      complianceReporting: boolean;
    };
  };
  qualityAssurance: {
    dataValidation: boolean;
    integrityChecks: boolean;
    duplicateDetection: boolean;
    qualityMetrics: {
      completeness: number;
      accuracy: number;
      timeliness: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Insurance/TPA Integration Types
export interface InsuranceIntegration {
  id: string;
  patientId: string;
  episodeId: string;
  insuranceProvider: {
    name: string;
    code: string;
    type: "government" | "private" | "corporate";
    contactInfo: {
      phone: string;
      email: string;
      website: string;
      address: string;
    };
    apiEndpoints: {
      eligibility: string;
      authorization: string;
      claims: string;
      status: string;
    };
  };
  policyDetails: {
    policyNumber: string;
    groupNumber?: string;
    membershipId: string;
    effectiveDate: string;
    expiryDate: string;
    coverageType: string;
    deductible: number;
    copayAmount: number;
    maxBenefit: number;
    remainingBenefit: number;
  };
  eligibilityVerification: {
    verified: boolean;
    verificationDate: string;
    verificationMethod: "real-time" | "batch" | "manual";
    eligibilityStatus: "active" | "inactive" | "suspended" | "terminated";
    coverageDetails: {
      homecareServices: boolean;
      nursingCare: boolean;
      physicalTherapy: boolean;
      medicalEquipment: boolean;
      medications: boolean;
      diagnostics: boolean;
    };
    limitations: Array<{
      serviceType: string;
      maxVisits?: number;
      maxAmount?: number;
      requiresPreAuth: boolean;
      restrictions: string[];
    }>;
  };
  preAuthorization: {
    required: boolean;
    status: "pending" | "approved" | "denied" | "expired";
    authorizationNumber?: string;
    approvedServices: string[];
    approvedAmount: number;
    validFrom: string;
    validTo: string;
    conditions: string[];
    reviewDate?: string;
  };
  claimsHistory: Array<{
    claimId: string;
    serviceDate: string;
    serviceType: string;
    amount: number;
    status: "submitted" | "processing" | "approved" | "denied" | "paid";
    denialReason?: string;
    paidAmount?: number;
    paymentDate?: string;
  }>;
  realTimeUpdates: {
    enabled: boolean;
    lastUpdate: string;
    updateFrequency: "immediate" | "hourly" | "daily";
    webhookUrl?: string;
  };
  complianceData: {
    regulatoryCompliance: string[];
    auditTrail: Array<{
      action: string;
      timestamp: string;
      userId: string;
      details: any;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

// Laboratory Integration Types
export interface LaboratoryIntegration {
  id: string;
  patientId: string;
  episodeId: string;
  laboratoryProvider: {
    name: string;
    license: string;
    accreditation: string[];
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
    apiConfiguration: {
      baseUrl: string;
      authMethod: "api-key" | "oauth2" | "certificate";
      dataFormat: "HL7" | "JSON" | "XML";
      version: string;
    };
  };
  testOrders: Array<{
    orderId: string;
    orderDate: string;
    orderedBy: string;
    testType: string;
    testCode: string;
    priority: "routine" | "urgent" | "stat";
    status: "ordered" | "collected" | "processing" | "completed" | "cancelled";
    collectionDate?: string;
    expectedResultDate?: string;
    specialInstructions?: string;
  }>;
  results: Array<{
    resultId: string;
    orderId: string;
    testName: string;
    testCode: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    status: "normal" | "abnormal" | "critical" | "pending";
    resultDate: string;
    verifiedBy: string;
    comments?: string;
    flagged: boolean;
    criticalAlert: boolean;
  }>;
  qualityControl: {
    sampleIntegrity: boolean;
    chainOfCustody: Array<{
      timestamp: string;
      handler: string;
      action: string;
      location: string;
    }>;
    qualityMetrics: {
      accuracy: number;
      precision: number;
      turnaroundTime: number;
    };
  };
  notifications: {
    criticalResults: {
      enabled: boolean;
      recipients: string[];
      methods: ("email" | "sms" | "phone" | "app")[];
    };
    resultAvailable: {
      enabled: boolean;
      autoNotify: boolean;
    };
  };
  integrationStatus: {
    connected: boolean;
    lastSync: string;
    syncErrors: string[];
    dataIntegrity: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Pharmacy Integration Types
export interface PharmacyIntegration {
  id: string;
  patientId: string;
  episodeId: string;
  pharmacyProvider: {
    name: string;
    license: string;
    chainCode?: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
    services: {
      homeDelivery: boolean;
      medicationSynchronization: boolean;
      adherenceMonitoring: boolean;
      clinicalConsultation: boolean;
    };
    apiConfiguration: {
      baseUrl: string;
      authMethod: string;
      dataFormat: string;
      version: string;
    };
  };
  prescriptions: Array<{
    prescriptionId: string;
    prescriptionNumber: string;
    prescribedDate: string;
    prescribedBy: string;
    medication: {
      name: string;
      genericName: string;
      strength: string;
      dosageForm: string;
      ndc: string;
      rxcui?: string;
    };
    dosage: {
      amount: string;
      frequency: string;
      route: string;
      duration: string;
    };
    quantity: {
      prescribed: number;
      dispensed: number;
      remaining: number;
    };
    refills: {
      authorized: number;
      remaining: number;
      lastRefillDate?: string;
      nextRefillDate?: string;
    };
    status: "active" | "completed" | "discontinued" | "on-hold";
  }>;
  medicationAdherence: {
    overallScore: number;
    trackingMethod: "manual" | "smart-device" | "pharmacy-records";
    adherenceHistory: Array<{
      date: string;
      medicationId: string;
      taken: boolean;
      timeOfDay: string;
      notes?: string;
    }>;
    alerts: Array<{
      type: "missed-dose" | "refill-due" | "interaction" | "side-effect";
      severity: "low" | "medium" | "high" | "critical";
      message: string;
      timestamp: string;
      acknowledged: boolean;
    }>;
  };
  drugInteractions: {
    screeningEnabled: boolean;
    interactions: Array<{
      medicationA: string;
      medicationB: string;
      severity: "minor" | "moderate" | "major";
      description: string;
      clinicalSignificance: string;
      recommendation: string;
      dateIdentified: string;
    }>;
    allergies: Array<{
      allergen: string;
      reaction: string;
      severity: string;
      dateReported: string;
    }>;
  };
  deliveryTracking: {
    homeDeliveryEnabled: boolean;
    deliveries: Array<{
      deliveryId: string;
      prescriptionIds: string[];
      scheduledDate: string;
      deliveredDate?: string;
      status: "scheduled" | "in-transit" | "delivered" | "failed";
      trackingNumber?: string;
      deliveryMethod: "courier" | "mail" | "pickup";
      signature?: string;
    }>;
  };
  clinicalServices: {
    medicationReview: {
      enabled: boolean;
      lastReviewDate?: string;
      nextReviewDate?: string;
      reviewFindings: string[];
    };
    vaccinations: {
      available: boolean;
      records: Array<{
        vaccine: string;
        dateAdministered: string;
        lotNumber: string;
        administeredBy: string;
      }>;
    };
  };
  integrationStatus: {
    connected: boolean;
    lastSync: string;
    syncErrors: string[];
    realTimeUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Third-Party Integration Response Types
export interface ThirdPartyIntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    source: string;
    version: string;
  };
  compliance: {
    dataProtection: boolean;
    auditLogged: boolean;
    consentVerified: boolean;
  };
}

// Administrative API Types
export interface StaffSchedule {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  schedule_date: string;
  shift_type: "morning" | "afternoon" | "night" | "on_call";
  start_time: string;
  end_time: string;
  break_duration: number; // minutes
  location: string;
  patient_assignments?: string[];
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  overtime_approved: boolean;
  overtime_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TimesheetEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  date: string;
  clock_in_time: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  location: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  verification_method: "manual" | "biometric" | "gps" | "photo";
  verification_data?: any;
  status: "draft" | "submitted" | "approved" | "rejected";
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  incident_id: string;
  incident_type:
    | "safety"
    | "quality"
    | "equipment"
    | "medication"
    | "patient_fall"
    | "infection"
    | "clinical_care"
    | "documentation"
    | "communication"
    | "behavioral"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "investigating" | "resolved" | "closed";
  reported_by: string;
  reported_date: string;
  incident_date: string;
  incident_time: string;
  location: string;
  description: string;
  immediate_actions: string;
  witnesses: string[];
  photos: string[];
  documents: string[];
  investigation: {
    investigator?: string;
    investigation_date?: string;
    findings?: string;
    root_cause?: string;
    contributing_factors?: string[];
  };
  corrective_actions: Array<{
    id: string;
    description: string;
    assigned_to: string;
    due_date: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    completion_date?: string;
    notes?: string;
  }>;
  regulatory_notification: {
    required: boolean;
    notified?: boolean;
    notification_date?: string;
    reference_number?: string;
  };
  approval: {
    status: "pending" | "approved" | "rejected";
    approved_by?: string;
    approved_date?: string;
    comments?: string;
  };
  doh_taxonomy?: {
    level_1: string;
    level_2: string;
    level_3: string;
    level_4: string;
    level_5: string;
  };
  doh_reportable: boolean;
  whistleblowing_eligible: boolean;
  documentation_compliance?: {
    loinc_codes_validated: boolean;
    required_loinc_codes: string[];
    documentation_quality_score: number;
    coding_standards_met: boolean;
    quality_metrics: {
      completeness_score: number;
      accuracy_score: number;
      timeliness_score: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface CommunicationMessage {
  id: string;
  channel_id: string;
  channel_name: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message_type: "text" | "voice" | "image" | "file" | "emergency" | "system";
  content: string;
  attachments?: Array<{
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    url: string;
  }>;
  voice_data?: {
    duration: number;
    transcript?: string;
    audio_url: string;
  };
  priority: "low" | "medium" | "high" | "critical";
  read_by: Array<{
    user_id: string;
    read_at: string;
  }>;
  replied_to?: string; // message ID
  forwarded_from?: string; // message ID
  emergency_data?: {
    emergency_type: string;
    location: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    contacts_notified: string[];
  };
  delivery_status: "sent" | "delivered" | "read" | "failed";
  offline_queued: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  description?: string;
  type: "public" | "private" | "emergency" | "department" | "project";
  department?: string;
  members: Array<{
    user_id: string;
    user_name: string;
    role: string;
    joined_at: string;
    permissions: string[];
  }>;
  settings: {
    allow_file_sharing: boolean;
    allow_voice_messages: boolean;
    message_retention_days: number;
    notification_level: "all" | "mentions" | "none";
    emergency_escalation: boolean;
  };
  last_message?: {
    message_id: string;
    content: string;
    sender_name: string;
    timestamp: string;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: "push" | "email" | "sms" | "in_app";
  enabled: boolean;
  priority_filter: "all" | "high_critical" | "critical_only";
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  channel_preferences: Array<{
    channel_id: string;
    notification_level: "all" | "mentions" | "none";
  }>;
  emergency_override: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced EMR Integration Types
export interface ClinicalDecisionSupportRequest {
  patientId: string;
  clinicalContext: {
    primaryDiagnosis: string;
    secondaryDiagnoses?: string[];
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    allergies: string[];
    vitalSigns?: any;
    labResults?: any[];
  };
  decisionPoint: "diagnosis" | "treatment" | "medication" | "monitoring";
}

export interface ClinicalRecommendation {
  id: string;
  type: "guideline" | "alert" | "suggestion" | "reminder";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  evidence: {
    level: "A" | "B" | "C" | "D";
    source: string;
    references: string[];
  };
  actions: Array<{
    action: string;
    parameters?: any;
    contraindications?: string[];
  }>;
}

export interface PatientAnalyticsReport {
  patientSummary: {
    demographics: any;
    clinicalProfile: any;
    riskFactors: string[];
    qualityScores: any;
  };
  careAnalytics: {
    episodeCount: number;
    averageEpisodeDuration: number;
    serviceUtilization: Array<{
      service: string;
      frequency: number;
      cost: number;
      outcomes: any;
    }>;
    adherenceMetrics: {
      medication: number;
      appointment: number;
      carePlan: number;
    };
  };
  outcomeMetrics: {
    clinicalOutcomes: Array<{
      measure: string;
      baseline: number;
      current: number;
      improvement: number;
      target: number;
    }>;
    qualityOfLife: {
      score: number;
      domains: any;
      trend: "improving" | "stable" | "declining";
    };
    functionalStatus: {
      adlScore: number;
      mobilityLevel: string;
      independenceLevel: string;
    };
  };
  riskAssessment: {
    overallRisk: "low" | "medium" | "high" | "critical";
    riskFactors: Array<{
      factor: string;
      severity: number;
      modifiable: boolean;
      interventions: string[];
    }>;
    predictiveModels: Array<{
      model: string;
      prediction: string;
      confidence: number;
      timeframe: string;
    }>;
  };
  recommendations: {
    clinical: string[];
    operational: string[];
    financial: string[];
    quality: string[];
  };
  benchmarking: {
    peerComparison: any;
    industryBenchmarks: any;
    performancePercentile: number;
  };
}

export interface PopulationHealthInsights {
  populationSummary: {
    totalPatients: number;
    demographics: any;
    riskDistribution: any;
  };
  healthTrends: Array<{
    indicator: string;
    trend: "improving" | "stable" | "declining";
    changeRate: number;
    significance: "significant" | "not_significant";
    factors: string[];
  }>;
  outcomeAnalysis: {
    clinicalOutcomes: any;
    qualityMetrics: any;
    costEffectiveness: any;
  };
  riskStratification: Array<{
    riskLevel: string;
    patientCount: number;
    characteristics: string[];
    interventions: string[];
  }>;
  recommendations: {
    populationHealth: string[];
    resourceAllocation: string[];
    interventionPriorities: string[];
  };
}

export interface IntegratedClinicalAssessment {
  patientId: string;
  episodeId: string;
  assessmentType: "initial" | "follow_up" | "discharge" | "emergency";
  clinicalFindings: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    physicalExamination: any;
    vitalSigns: any;
    mentalStatusExam?: any;
    functionalAssessment?: any;
  };
  diagnosticData?: {
    labResults?: any[];
    imagingResults?: any[];
    diagnosticTests?: any[];
  };
  treatmentPlan: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions: string;
    }>;
    interventions?: Array<{
      type: string;
      description: string;
      frequency: string;
      duration?: string;
    }>;
    followUp?: {
      timeframe: string;
      provider: string;
      instructions: string;
    };
  };
  providerId: string;
  requiresApproval?: boolean;
}

// Enhanced Competency Management Types
export interface DOHCompetencyFramework {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
  expiryDate: string;
  dohStandardsAlignment: {
    standardVersion: "V2/2024";
    complianceLevel: "full" | "partial" | "pending";
    lastAuditDate: string;
    nextAuditDate: string;
    auditScore: number;
  };
  nineDomains: {
    clinicalCare: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    patientSafety: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    infectionControl: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    medicationManagement: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    documentationStandards: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    continuityOfCare: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    patientRights: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    qualityImprovement: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
    professionalDevelopment: {
      enabled: boolean;
      competencies: string[];
      assessmentMethods: string[];
      evidenceRequirements: string[];
    };
  };
  jawdaIntegration: {
    qualityIndicators: Array<{
      category: string;
      indicator: string;
      target: number;
      measurement: string;
      frequency: string;
    }>;
    performanceMetrics: Array<{
      metric: string;
      benchmark: number;
      currentValue: number;
      trend: "improving" | "stable" | "declining";
    }>;
  };
  targetRoles: Array<{
    role: string;
    level: "entry" | "intermediate" | "advanced" | "expert";
    prerequisites: string[];
    certificationRequired: boolean;
  }>;
  assessmentFramework: {
    methods: Array<{
      type:
        | "observation"
        | "simulation"
        | "portfolio"
        | "examination"
        | "peer_review";
      weight: number;
      passingScore: number;
      validityPeriod: number;
    }>;
    qualityAssurance: {
      interRaterReliability: number;
      contentValidity: boolean;
      criterionValidity: boolean;
      testRetest: number;
    };
  };
  continuingEducation: {
    cpdPointsRequired: number;
    renewalPeriod: number;
    mandatoryTopics: string[];
    approvedProviders: string[];
  };
  qualityMetrics: {
    completionRate: number;
    passRate: number;
    satisfactionScore: number;
    employerFeedback: number;
    patientOutcomes: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  status: "draft" | "review" | "approved" | "published" | "archived";
}

export interface CompetencyAssessment {
  id: string;
  competencyFrameworkId: string;
  assesseeId: string;
  assessorId: string;
  assessmentDate: string;
  assessmentType: "initial" | "renewal" | "remedial" | "audit";
  domainAssessments: {
    [domain: string]: {
      score: number;
      maxScore: number;
      passed: boolean;
      evidenceSubmitted: string[];
      assessorComments: string;
      improvementAreas: string[];
    };
  };
  overallResult: {
    totalScore: number;
    maxTotalScore: number;
    percentage: number;
    passed: boolean;
    grade: "A" | "B" | "C" | "D" | "F";
    certification: {
      eligible: boolean;
      certificateId?: string;
      validFrom?: string;
      validTo?: string;
    };
  };
  qualityAssurance: {
    secondAssessorId?: string;
    secondAssessorScore?: number;
    interRaterAgreement?: number;
    moderationRequired: boolean;
    moderatorId?: string;
    finalScore?: number;
  };
  actionPlan: {
    required: boolean;
    objectives: string[];
    timeline: string;
    supportRequired: string[];
    followUpDate?: string;
  };
  dohCompliance: {
    standardsMet: string[];
    standardsNotMet: string[];
    complianceScore: number;
    auditTrail: Array<{
      action: string;
      timestamp: string;
      userId: string;
      details: any;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  status: "scheduled" | "in_progress" | "completed" | "reviewed" | "certified";
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  competencyFrameworkIds: string[];
  dohAlignment: {
    standardsCompliance: boolean;
    standardsVersion: string;
    domainsCovered: string[];
    jawdaMapping: string[];
    regulatoryLevel: "basic" | "intermediate" | "advanced";
    complianceScore: number;
  };
  content: {
    type: "video" | "document" | "interactive" | "simulation" | "assessment";
    format: string;
    duration: number;
    language: string[];
    accessibility: {
      subtitles: boolean;
      audioDescription: boolean;
      screenReader: boolean;
      mobileOptimized: boolean;
    };
    url?: string;
    embedCode?: string;
    downloadable: boolean;
  };
  learningObjectives: Array<{
    objective: string;
    bloomsLevel:
      | "remember"
      | "understand"
      | "apply"
      | "analyze"
      | "evaluate"
      | "create";
    assessmentMethod: string;
    evidenceRequired: string;
  }>;
  prerequisites: {
    competencies: string[];
    certifications: string[];
    experience: string;
    education: string;
  };
  assessment: {
    required: boolean;
    type: "quiz" | "practical" | "portfolio" | "peer_review";
    passingScore: number;
    attempts: number;
    timeLimit?: number;
    questions?: Array<{
      id: string;
      type: "multiple_choice" | "true_false" | "essay" | "practical";
      question: string;
      options?: string[];
      correctAnswer?: string | string[];
      points: number;
      explanation?: string;
    }>;
  };
  certification: {
    eligible: boolean;
    cpdPoints: number;
    validityPeriod: number;
    renewalRequired: boolean;
    certificateTemplate?: string;
  };
  qualityMetrics: {
    completionRate: number;
    passRate: number;
    averageScore: number;
    satisfactionRating: number;
    timeToComplete: number;
    dropoutRate: number;
  };
  feedback: {
    learnerFeedback: Array<{
      userId: string;
      rating: number;
      comments: string;
      timestamp: string;
    }>;
    instructorFeedback: Array<{
      instructorId: string;
      effectiveness: number;
      suggestions: string;
      timestamp: string;
    }>;
  };
  version: string;
  lastUpdated: string;
  nextReviewDate: string;
  createdBy: string;
  approvedBy?: string;
  status: "draft" | "review" | "approved" | "published" | "archived";
  tags: string[];
  targetAudience: string[];
  estimatedCost?: number;
  vendor?: string;
}

export interface QualityIndicator {
  id: string;
  name: string;
  description: string;
  category: "structure" | "process" | "outcome";
  jawdaDomain: string;
  dohRequirement: boolean;
  measurement: {
    numerator: string;
    denominator: string;
    formula: string;
    unit: string;
    dataSource: string[];
  };
  targets: {
    minimum: number;
    target: number;
    benchmark: number;
    worldClass: number;
  };
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  reportingLevel: "unit" | "department" | "organization" | "system";
  stakeholders: string[];
  dataCollection: {
    automated: boolean;
    source: string;
    responsible: string;
    validationRequired: boolean;
  };
  currentPerformance: {
    value: number;
    trend: "improving" | "stable" | "declining";
    lastUpdated: string;
    dataQuality: "high" | "medium" | "low";
  };
  benchmarking: {
    national?: number;
    international?: number;
    peerGroup?: number;
    percentileRank?: number;
  };
  actionThresholds: {
    green: { min: number; max: number };
    yellow: { min: number; max: number };
    red: { min: number; max: number };
  };
  improvementActions: Array<{
    threshold: "yellow" | "red";
    action: string;
    responsible: string;
    timeline: string;
    resources: string[];
  }>;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "under_review";
}

// DOH Compliance Validation Types - Foundation & Core Validation

/**
 * DOH Core Standards Configuration
 * Defines the core DOH standards and validation rules
 */
export interface DOHCoreStandards {
  standardId: string;
  version: string;
  effectiveDate: string;
  domains: {
    clinical_care: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    patient_safety: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    infection_control: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    medication_management: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    documentation_standards: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    continuity_of_care: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    patient_rights: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    quality_improvement: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
    professional_development: {
      requirements: Array<{
        id: string;
        title: string;
        description: string;
        mandatory: boolean;
        validationRules: string[];
        evidenceRequired: string[];
      }>;
    };
  };
  validationEngine: {
    version: string;
    rulesEngine: string;
    automatedChecks: string[];
    manualChecks: string[];
  };
  complianceThresholds: {
    excellent: number; // >= 95%
    good: number; // >= 85%
    satisfactory: number; // >= 75%
    needs_improvement: number; // >= 60%
    critical: number; // < 60%
  };
}

/**
 * DOH Validation Engine Configuration
 * Core validation engine settings and rules
 */
export interface DOHValidationEngine {
  engineId: string;
  version: string;
  standardsVersion: string;
  validationRules: {
    [domain: string]: {
      [ruleId: string]: {
        name: string;
        description: string;
        type: "required" | "conditional" | "optional";
        severity: "critical" | "major" | "minor" | "warning";
        validationLogic: string;
        errorMessage: string;
        recommendations: string[];
        references: {
          dohStandard: string;
          section: string;
          requirement: string;
        };
      };
    };
  };
  scoringMatrix: {
    [domain: string]: {
      maxScore: number;
      weightage: number;
      criticalRequirements: string[];
      scoringRules: Array<{
        condition: string;
        points: number;
        description: string;
      }>;
    };
  };
  complianceCalculation: {
    method: "weighted_average" | "minimum_threshold" | "composite";
    domainWeights: { [domain: string]: number };
    passingThreshold: number;
    criticalFailureThreshold: number;
  };
}

/**
 * Validation Cache Entry
 * For caching validation results to improve performance
 */
export interface DOHValidationCacheEntry {
  cacheKey: string;
  validationResult: DOHValidationResult;
  cachedAt: string;
  expiresAt: string;
  hitCount: number;
  lastAccessed: string;
  cacheMetadata: {
    formType: string;
    formDataHash: string;
    validationRulesVersion: string;
  };
}

/**
 * Validation Queue Item
 * For managing validation queue and background processing
 */
export interface DOHValidationQueueItem {
  queueId: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  validationRequest: {
    patientId?: string;
    episodeId?: string;
    formId?: string;
    formType: string;
    formData: any;
    validationType: string;
    validationScope: string;
  };
  requestedBy: string;
  requestedAt: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  processingTime?: number;
  retryCount: number;
  maxRetries: number;
  errorDetails?: string;
  result?: DOHValidationResult;
}

/**
 * Batch Validation Request
 * For validating multiple forms, episodes, or patients at once
 */
export interface DOHBatchValidationRequest {
  batchId: string;
  batchType: "forms" | "episodes" | "patients" | "department" | "organization";
  items: Array<{
    id: string;
    type: string;
    data: any;
    priority?: "low" | "medium" | "high" | "critical";
  }>;
  validationScope:
    | "single_form"
    | "episode_complete"
    | "patient_complete"
    | "department"
    | "organization";
  requestedBy: string;
  requestedAt: string;
  scheduledFor?: string;
  notificationSettings?: {
    onComplete: boolean;
    onError: boolean;
    recipients: string[];
  };
  processingOptions?: {
    enableCaching: boolean;
    backgroundProcessing: boolean;
    parallelProcessing: boolean;
    maxConcurrency: number;
  };
}

/**
 * Batch Validation Result
 * Results from batch validation operations
 */
export interface DOHBatchValidationResult {
  batchId: string;
  batchType: string;
  totalItems: number;
  processedItems: number;
  successfulValidations: number;
  failedValidations: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  processingTime?: number;
  results: DOHValidationResult[];
  summary: {
    overallComplianceRate: number;
    averageComplianceScore: number;
    totalCriticalFindings: number;
    totalErrors: number;
    totalWarnings: number;
    domainBreakdown: Array<{
      domain: string;
      averageScore: number;
      complianceRate: number;
      criticalIssues: number;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    systemWide: string[];
  };
  reportGenerated: boolean;
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Compliance Report Configuration
 * Settings for generating compliance reports
 */
export interface DOHComplianceReportConfig {
  reportId: string;
  reportType:
    | "validation_summary"
    | "compliance_status"
    | "audit_trail"
    | "trend_analysis"
    | "custom";
  scope: {
    type: "patient" | "episode" | "department" | "organization";
    id: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
  includeDetails: {
    domainBreakdown: boolean;
    criticalFindings: boolean;
    actionItems: boolean;
    trends: boolean;
    recommendations: boolean;
    auditTrail: boolean;
  };
  format: "pdf" | "excel" | "json" | "html";
  scheduledGeneration?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    nextRun: string;
    recipients: string[];
  };
  customFilters?: {
    domains?: string[];
    complianceThreshold?: number;
    severityLevels?: string[];
  };
  requestedBy: string;
  requestedAt: string;
}

/**
 * Compliance Analytics Data
 * Advanced analytics for compliance monitoring
 */
export interface DOHComplianceAnalytics {
  analyticsId: string;
  organizationId: string;
  reportingPeriod: {
    from: string;
    to: string;
    type: "monthly" | "quarterly" | "annual" | "custom";
  };
  overallMetrics: {
    totalValidations: number;
    complianceRate: number;
    averageScore: number;
    improvementRate: number;
    trendDirection: "improving" | "stable" | "declining";
  };
  domainAnalytics: Array<{
    domain: string;
    domainName: string;
    totalValidations: number;
    averageScore: number;
    complianceRate: number;
    trend: "improving" | "stable" | "declining";
    criticalIssues: number;
    resolvedIssues: number;
    topIssues: Array<{
      issue: string;
      frequency: number;
      impact: "low" | "medium" | "high" | "critical";
    }>;
  }>;
  performanceIndicators: {
    kpis: Array<{
      name: string;
      value: number;
      target: number;
      status: "met" | "not_met" | "exceeded";
      trend: "improving" | "stable" | "declining";
    }>;
    benchmarks: {
      industryAverage?: number;
      peerComparison?: number;
      bestPractice?: number;
      ranking?: number;
    };
  };
  riskAnalysis: {
    overallRisk: "low" | "medium" | "high" | "critical";
    riskFactors: Array<{
      factor: string;
      probability: number;
      impact: "low" | "medium" | "high" | "critical";
      mitigation: string[];
    }>;
    predictiveInsights: Array<{
      prediction: string;
      confidence: number;
      timeframe: string;
      recommendedActions: string[];
    }>;
  };
  actionItemAnalytics: {
    totalActionItems: number;
    completedItems: number;
    overdueItems: number;
    averageResolutionTime: number;
    itemsByPriority: {
      immediate: number;
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    itemsByDomain: Array<{
      domain: string;
      count: number;
      completionRate: number;
    }>;
  };
  complianceForecasting: {
    projectedScore: number;
    projectedDate: string;
    confidenceLevel: number;
    factors: string[];
    scenarios: Array<{
      scenario: string;
      probability: number;
      projectedOutcome: number;
      requiredActions: string[];
    }>;
  };
  generatedAt: string;
  generatedBy: string;
  nextUpdateDue: string;
}

/**
 * DOH Domain Validation Result
 * Represents validation results for each of the 9 DOH domains
 */
export interface DOHDomainValidation {
  domain:
    | "clinical_care"
    | "patient_safety"
    | "infection_control"
    | "medication_management"
    | "documentation_standards"
    | "continuity_of_care"
    | "patient_rights"
    | "quality_improvement"
    | "professional_development";
  domainName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "compliant" | "non_compliant" | "partial" | "not_applicable";
  validationChecks: Array<{
    checkId: string;
    checkName: string;
    description: string;
    required: boolean;
    passed: boolean;
    score: number;
    maxScore: number;
    evidence?: string[];
    recommendations?: string[];
  }>;
  criticalFindings: DOHCriticalFinding[];
  recommendations: string[];
  lastValidated: string;
  validatedBy: string;
  nextValidationDue?: string;
}

/**
 * DOH Validation Error Structure
 * Comprehensive error tracking for DOH compliance validation
 */
export interface DOHValidationError {
  errorId: string;
  errorCode: string;
  errorType: "critical" | "major" | "minor" | "warning";
  domain: string;
  section: string;
  field?: string;
  message: string;
  description: string;
  currentValue?: any;
  expectedValue?: any;
  validationRule: string;
  severity: "high" | "medium" | "low";
  impact: string;
  resolution: {
    required: boolean;
    steps: string[];
    timeframe: string;
    responsible: string;
    priority: "immediate" | "urgent" | "normal" | "low";
  };
  references: {
    dohStandard: string;
    section: string;
    requirement: string;
    guideline?: string;
  };
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

/**
 * DOH Validation Warning Structure
 * Non-critical issues that should be addressed for optimal compliance
 */
export interface DOHValidationWarning {
  warningId: string;
  warningCode: string;
  domain: string;
  section: string;
  field?: string;
  message: string;
  description: string;
  recommendation: string;
  impact: "quality" | "efficiency" | "best_practice" | "documentation";
  priority: "high" | "medium" | "low";
  actionRequired: boolean;
  suggestedActions: string[];
  references: {
    dohGuideline?: string;
    bestPractice?: string;
    jawdaIndicator?: string;
  };
  detectedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/**
 * DOH Critical Finding
 * Critical compliance issues requiring immediate attention
 */
export interface DOHCriticalFinding {
  findingId: string;
  findingType:
    | "safety"
    | "regulatory"
    | "quality"
    | "documentation"
    | "process";
  severity: "critical" | "high" | "medium";
  domain: string;
  title: string;
  description: string;
  impact: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  immediateActions: string[];
  correctiveActions: Array<{
    actionId: string;
    description: string;
    responsible: string;
    dueDate: string;
    status: "pending" | "in_progress" | "completed" | "overdue";
    priority: "immediate" | "urgent" | "normal";
  }>;
  regulatoryImplications: {
    dohReportable: boolean;
    jawdaImpact: boolean;
    licenseRisk: boolean;
    accreditationRisk: boolean;
  };
  evidence: string[];
  rootCause?: string;
  preventiveMeasures: string[];
  detectedAt: string;
  detectedBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

/**
 * DOH Action Item
 * Actionable items generated from validation results
 */
export interface DOHActionItem {
  actionId: string;
  type: "corrective" | "preventive" | "improvement" | "monitoring";
  priority: "immediate" | "urgent" | "high" | "medium" | "low";
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "overdue";
  title: string;
  description: string;
  domain: string;
  relatedFinding?: string;
  relatedError?: string;
  assignedTo: {
    userId: string;
    name: string;
    role: string;
    department: string;
  };
  dueDate: string;
  estimatedEffort: string;
  resources: string[];
  dependencies: string[];
  completionCriteria: string[];
  progress: {
    percentage: number;
    lastUpdated: string;
    milestones: Array<{
      milestone: string;
      completed: boolean;
      completedDate?: string;
      notes?: string;
    }>;
  };
  verification: {
    required: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationNotes?: string;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  completedAt?: string;
  completedBy?: string;
}

/**
 * DOH Validation Result
 * Comprehensive validation result structure
 */
export interface DOHValidationResult {
  validationId: string;
  patientId?: string;
  episodeId?: string;
  formId?: string;
  validationType:
    | "clinical_form"
    | "episode"
    | "patient_record"
    | "system_wide"
    | "periodic_audit";
  validationScope:
    | "single_form"
    | "episode_complete"
    | "patient_complete"
    | "department"
    | "organization";
  validationDate: string;
  validatedBy: string;
  validatorRole: string;

  // Overall Validation Status
  overallStatus: "compliant" | "non_compliant" | "partial" | "pending_review";
  complianceScore: {
    total: number;
    maxTotal: number;
    percentage: number;
    grade: "A" | "B" | "C" | "D" | "F";
  };

  // Domain-specific Validation Results
  domainValidations: DOHDomainValidation[];

  // Issues and Findings
  errors: DOHValidationError[];
  warnings: DOHValidationWarning[];
  criticalFindings: DOHCriticalFinding[];
  actionItems: DOHActionItem[];

  // Validation Metadata
  validationMetadata: {
    standardVersion: string;
    validationRules: string[];
    automatedChecks: number;
    manualChecks: number;
    totalChecks: number;
    processingTime: number;
    dataQuality: "high" | "medium" | "low";
    completeness: number;
  };

  // Compliance Tracking
  complianceTracking: {
    previousValidationId?: string;
    improvementSince?: number;
    trendDirection: "improving" | "stable" | "declining";
    consecutiveCompliantValidations: number;
    lastNonCompliantDate?: string;
  };

  // Recommendations and Next Steps
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    bestPractices: string[];
  };

  // Audit Trail
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details: any;
  }>;

  // Next Validation
  nextValidation: {
    scheduledDate: string;
    type: "routine" | "follow_up" | "corrective" | "audit";
    scope: string;
    assignedTo?: string;
  };

  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  status: "draft" | "completed" | "reviewed" | "approved" | "archived";
}

/**
 * DOH Compliance Status
 * Overall compliance status and metrics
 */
export interface DOHComplianceStatus {
  statusId: string;
  organizationId: string;
  departmentId?: string;
  reportingPeriod: {
    from: string;
    to: string;
    type: "monthly" | "quarterly" | "annual" | "custom";
  };

  // Overall Compliance Metrics
  overallCompliance: {
    score: number;
    maxScore: number;
    percentage: number;
    grade: "A" | "B" | "C" | "D" | "F";
    status:
      | "excellent"
      | "good"
      | "satisfactory"
      | "needs_improvement"
      | "critical";
    trend: "improving" | "stable" | "declining";
    trendPercentage: number;
  };

  // Domain-specific Compliance
  domainCompliance: Array<{
    domain: string;
    domainName: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: "compliant" | "non_compliant" | "partial";
    trend: "improving" | "stable" | "declining";
    criticalIssues: number;
    actionItems: number;
    lastValidated: string;
  }>;

  // Key Performance Indicators
  kpis: {
    totalValidations: number;
    compliantValidations: number;
    complianceRate: number;
    averageComplianceScore: number;
    criticalFindings: number;
    resolvedFindings: number;
    pendingActionItems: number;
    overdueActionItems: number;
    averageResolutionTime: number;
  };

  // Risk Assessment
  riskAssessment: {
    overallRisk: "low" | "medium" | "high" | "critical";
    riskFactors: Array<{
      factor: string;
      impact: "low" | "medium" | "high";
      likelihood: "low" | "medium" | "high";
      mitigation: string[];
    }>;
    regulatoryRisk: {
      level: "low" | "medium" | "high" | "critical";
      areas: string[];
      implications: string[];
    };
  };

  // Improvement Tracking
  improvementMetrics: {
    improvementRate: number;
    areasOfImprovement: string[];
    successStories: string[];
    challengingAreas: string[];
    resourceNeeds: string[];
  };

  // Benchmarking
  benchmarking: {
    industryAverage?: number;
    peerComparison?: number;
    bestPracticeGap?: number;
    rankingPercentile?: number;
  };

  // Recommendations
  strategicRecommendations: {
    priority: "high" | "medium" | "low";
    category: "process" | "training" | "technology" | "policy" | "resource";
    recommendation: string;
    expectedImpact: string;
    timeframe: string;
    resources: string[];
  }[];

  // Reporting
  reportingMetadata: {
    generatedAt: string;
    generatedBy: string;
    reportVersion: string;
    dataSourcesUsed: string[];
    validationPeriod: string;
    nextReportDue: string;
  };

  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  publishedAt?: string;
  status: "draft" | "review" | "approved" | "published" | "archived";
}

// ============================================================================
// DOH COMPLIANCE VALIDATION TYPES - ENHANCED TYPE SYSTEM
// ============================================================================

/**
 * DOH Validation Request Types
 * Comprehensive request structures for different validation scenarios
 */
export interface DOHValidationRequest {
  requestId: string;
  requestType: "single_form" | "episode" | "patient" | "batch" | "audit";
  priority: "low" | "medium" | "high" | "critical";
  validationScope: {
    patientId?: string;
    episodeId?: string;
    formId?: string;
    formType?: string;
    department?: string;
    dateRange?: {
      from: string;
      to: string;
    };
  };
  validationOptions: {
    enableCaching: boolean;
    backgroundProcessing: boolean;
    generateReport: boolean;
    notifyOnCompletion: boolean;
    includeRecommendations: boolean;
    detailedAnalysis: boolean;
  };
  requestedBy: string;
  requestedAt: string;
  scheduledFor?: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * DOH Validation Response Types
 * Standardized response structures for validation operations
 */
export interface DOHValidationResponse {
  success: boolean;
  validationId: string;
  requestId: string;
  status: "completed" | "processing" | "failed" | "queued";
  result?: DOHValidationResult;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    processingTime: number;
    timestamp: string;
    version: string;
    cacheHit: boolean;
  };
  links?: {
    reportUrl?: string;
    detailsUrl?: string;
    retryUrl?: string;
  };
}

/**
 * DOH Validation Context
 * Context information for validation operations
 */
export interface DOHValidationContext {
  contextId: string;
  organizationId: string;
  departmentId?: string;
  validatorId: string;
  validatorRole: string;
  validationEnvironment: "production" | "staging" | "development";
  standardsVersion: string;
  rulesVersion: string;
  locale: string;
  timezone: string;
  customRules?: Array<{
    ruleId: string;
    ruleName: string;
    enabled: boolean;
    parameters?: any;
  }>;
  overrides?: Array<{
    domain: string;
    rule: string;
    action: "skip" | "warning" | "error";
    reason: string;
    approvedBy: string;
  }>;
}

/**
 * DOH Validation Metrics
 * Performance and quality metrics for validation operations
 */
export interface DOHValidationMetrics {
  metricsId: string;
  validationId: string;
  performance: {
    totalProcessingTime: number;
    validationTime: number;
    reportGenerationTime: number;
    cacheOperationTime: number;
    databaseOperationTime: number;
  };
  quality: {
    dataCompletenessScore: number;
    dataAccuracyScore: number;
    validationCoverageScore: number;
    ruleExecutionSuccess: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
  };
  resource: {
    memoryUsage: number;
    cpuUsage: number;
    networkCalls: number;
    databaseQueries: number;
    cacheHits: number;
    cacheMisses: number;
  };
  compliance: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    skippedChecks: number;
    warningChecks: number;
    criticalFailures: number;
  };
  generatedAt: string;
}

/**
 * DOH Validation History
 * Historical tracking of validation operations
 */
export interface DOHValidationHistory {
  historyId: string;
  patientId?: string;
  episodeId?: string;
  formId?: string;
  validationTimeline: Array<{
    validationId: string;
    validationDate: string;
    validationType: string;
    complianceScore: number;
    status: string;
    criticalFindings: number;
    actionItems: number;
    validatedBy: string;
  }>;
  trends: {
    complianceScoreTrend: "improving" | "stable" | "declining";
    averageScore: number;
    bestScore: number;
    worstScore: number;
    improvementRate: number;
    consistencyScore: number;
  };
  patterns: {
    commonIssues: Array<{
      issue: string;
      frequency: number;
      lastOccurrence: string;
      resolved: boolean;
    }>;
    seasonalTrends: Array<{
      period: string;
      averageScore: number;
      commonIssues: string[];
    }>;
    improvementAreas: string[];
  };
  milestones: Array<{
    milestone: string;
    achievedDate: string;
    description: string;
    impact: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * DOH Validation Configuration
 * System-wide validation configuration settings
 */
export interface DOHValidationConfiguration {
  configId: string;
  organizationId: string;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  globalSettings: {
    enableAutomaticValidation: boolean;
    enableBackgroundProcessing: boolean;
    enableCaching: boolean;
    cacheExpiryMinutes: number;
    maxConcurrentValidations: number;
    validationTimeout: number;
    retryAttempts: number;
    notificationSettings: {
      enableEmailNotifications: boolean;
      enableSMSNotifications: boolean;
      enableInAppNotifications: boolean;
      criticalFindingsNotification: boolean;
      complianceReportNotification: boolean;
    };
  };
  domainSettings: {
    [domain: string]: {
      enabled: boolean;
      weight: number;
      criticalThreshold: number;
      warningThreshold: number;
      customRules: string[];
      skipRules: string[];
    };
  };
  reportingSettings: {
    enableAutomaticReports: boolean;
    reportFormats: string[];
    reportSchedule: string;
    reportRecipients: string[];
    includeRecommendations: boolean;
    includeTrends: boolean;
    includeActionItems: boolean;
  };
  integrationSettings: {
    enableAPIAccess: boolean;
    enableWebhooks: boolean;
    webhookEndpoints: Array<{
      event: string;
      url: string;
      enabled: boolean;
    }>;
    apiRateLimit: number;
    apiTimeout: number;
  };
  auditSettings: {
    enableAuditLogging: boolean;
    auditRetentionDays: number;
    auditLevel: "basic" | "detailed" | "comprehensive";
    enablePerformanceLogging: boolean;
    enableErrorLogging: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  status: "draft" | "active" | "inactive" | "archived";
}

/**
 * DOH Compliance Dashboard Data
 * Real-time dashboard data structure
 */
export interface DOHComplianceDashboard {
  dashboardId: string;
  organizationId: string;
  departmentId?: string;
  generatedAt: string;
  dataFreshness: string;
  realTimeMetrics: {
    currentComplianceScore: number;
    activeValidations: number;
    pendingActionItems: number;
    criticalFindings: number;
    todaysValidations: number;
    weeklyTrend: number;
  };
  quickStats: {
    totalPatients: number;
    activeEpisodes: number;
    completedForms: number;
    complianceRate: number;
    averageScore: number;
    improvementRate: number;
  };
  alerts: Array<{
    alertId: string;
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
    actionRequired: boolean;
    acknowledged: boolean;
  }>;
  recentActivity: Array<{
    activityId: string;
    type: "validation" | "action_item" | "finding" | "report";
    description: string;
    timestamp: string;
    userId: string;
    userName: string;
  }>;
  upcomingTasks: Array<{
    taskId: string;
    type: "validation" | "audit" | "review" | "training";
    title: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
    assignedTo: string;
  }>;
  performanceCharts: {
    complianceTrend: Array<{
      date: string;
      score: number;
      validations: number;
    }>;
    domainBreakdown: Array<{
      domain: string;
      score: number;
      trend: "up" | "down" | "stable";
    }>;
    actionItemsProgress: Array<{
      date: string;
      created: number;
      completed: number;
      pending: number;
    }>;
  };
  recommendations: Array<{
    type: "immediate" | "short_term" | "long_term";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    expectedImpact: string;
  }>;
}

/**
 * DOH Validation Audit Trail
 * Comprehensive audit trail for validation operations
 */
export interface DOHValidationAuditTrail {
  auditId: string;
  validationId: string;
  auditEvents: Array<{
    eventId: string;
    eventType:
      | "validation_started"
      | "validation_completed"
      | "error_occurred"
      | "action_taken"
      | "status_changed";
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    details: {
      before?: any;
      after?: any;
      reason?: string;
      impact?: string;
      metadata?: any;
    };
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }>;
  systemEvents: Array<{
    eventId: string;
    eventType:
      | "system_action"
      | "automated_process"
      | "scheduled_task"
      | "integration_call";
    timestamp: string;
    component: string;
    action: string;
    result: "success" | "failure" | "warning";
    details: any;
    processingTime?: number;
    resourceUsage?: any;
  }>;
  dataChanges: Array<{
    changeId: string;
    timestamp: string;
    entityType: "patient" | "episode" | "form" | "validation" | "action_item";
    entityId: string;
    changeType: "create" | "update" | "delete" | "status_change";
    fieldChanges: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      changeReason?: string;
    }>;
    changedBy: string;
    approvedBy?: string;
  }>;
  complianceEvents: Array<{
    eventId: string;
    timestamp: string;
    eventType:
      | "compliance_achieved"
      | "compliance_lost"
      | "critical_finding"
      | "finding_resolved";
    domain: string;
    description: string;
    impact: "low" | "medium" | "high" | "critical";
    actionTaken?: string;
    responsible?: string;
  }>;
  createdAt: string;
  retentionUntil: string;
  archived: boolean;
}

/**
 * DOH Validation Performance Analytics
 * Advanced analytics for validation performance optimization
 */
export interface DOHValidationPerformanceAnalytics {
  analyticsId: string;
  organizationId: string;
  analysisPeriod: {
    from: string;
    to: string;
    type: "daily" | "weekly" | "monthly" | "quarterly" | "custom";
  };
  validationPerformance: {
    totalValidations: number;
    averageProcessingTime: number;
    successRate: number;
    errorRate: number;
    timeoutRate: number;
    cacheHitRate: number;
    throughput: number;
    peakLoadTime: string;
    bottlenecks: Array<{
      component: string;
      averageTime: number;
      maxTime: number;
      frequency: number;
      impact: "low" | "medium" | "high";
    }>;
  };
  qualityMetrics: {
    dataQualityScore: number;
    validationAccuracy: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    ruleEffectiveness: Array<{
      ruleId: string;
      ruleName: string;
      executionCount: number;
      successRate: number;
      averageTime: number;
      findings: number;
    }>;
  };
  resourceUtilization: {
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    averageCpuUsage: number;
    peakCpuUsage: number;
    networkUtilization: number;
    databaseConnections: number;
    storageUsage: number;
  };
  userBehaviorAnalytics: {
    mostActiveUsers: Array<{
      userId: string;
      userName: string;
      validationCount: number;
      averageScore: number;
      errorRate: number;
    }>;
    validationPatterns: Array<{
      pattern: string;
      frequency: number;
      timeOfDay: string;
      dayOfWeek: string;
    }>;
    commonWorkflows: Array<{
      workflow: string;
      frequency: number;
      averageTime: number;
      successRate: number;
    }>;
  };
  systemHealth: {
    uptime: number;
    availability: number;
    errorFrequency: number;
    maintenanceWindows: Array<{
      start: string;
      end: string;
      type: string;
      impact: string;
    }>;
    alertsGenerated: number;
    incidentsResolved: number;
  };
  recommendations: {
    performance: Array<{
      area: string;
      recommendation: string;
      expectedImprovement: string;
      effort: "low" | "medium" | "high";
      priority: "low" | "medium" | "high";
    }>;
    optimization: Array<{
      component: string;
      optimization: string;
      expectedBenefit: string;
      implementationCost: string;
    }>;
    scaling: Array<{
      metric: string;
      currentCapacity: string;
      projectedNeed: string;
      recommendation: string;
      timeline: string;
    }>;
  };
  generatedAt: string;
  generatedBy: string;
  nextAnalysisDue: string;
}
