/**
 * Dynamic Form Generation Engine
 * Provides comprehensive form generation capabilities with smart validation and conditional logic
 */

export interface FormField {
  id: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file"
    | "signature";
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  conditionalLogic?: ConditionalRule[];
  defaultValue?: any;
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ConditionalRule {
  condition: {
    field: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    value: any;
  };
  action: "show" | "hide" | "require" | "disable";
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  layout: FormLayout;
  styling: FormStyling;
  metadata: Record<string, any>;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormLayout {
  type: "single-column" | "two-column" | "grid" | "tabs" | "accordion";
  sections?: FormSection[];
  responsive: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface FormStyling {
  theme: "default" | "reyada" | "clinical" | "administrative";
  customCSS?: string;
  fieldSpacing: "compact" | "normal" | "spacious";
  labelPosition: "top" | "left" | "floating";
}

export interface FormSubmission {
  formId: string;
  data: Record<string, any>;
  metadata: {
    submittedAt: Date;
    submittedBy: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
  validation: {
    isValid: boolean;
    errors: ValidationError[];
  };
  signature?: {
    data: string;
    timestamp: Date;
    userId: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  type: string;
}

class FormGenerationEngine {
  private static instance: FormGenerationEngine;
  private templates: Map<string, FormTemplate> = new Map();
  private submissions: Map<string, FormSubmission[]> = new Map();

  public static getInstance(): FormGenerationEngine {
    if (!FormGenerationEngine.instance) {
      FormGenerationEngine.instance = new FormGenerationEngine();
    }
    return FormGenerationEngine.instance;
  }

  /**
   * Initialize the form generation engine with default templates
   */
  public async initialize(): Promise<void> {
    console.log("🔧 Initializing Form Generation Engine...");

    // Load default clinical form templates
    await this.loadDefaultTemplates();

    console.log("✅ Form Generation Engine initialized successfully");
  }

  /**
   * Create a new form template
   */
  public createTemplate(
    template: Omit<FormTemplate, "id" | "createdAt" | "updatedAt">,
  ): FormTemplate {
    const newTemplate: FormTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * Generate a dynamic form based on template
   */
  public generateForm(
    templateId: string,
    customizations?: Partial<FormTemplate>,
  ): FormTemplate | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Form template not found: ${templateId}`);
      return null;
    }

    // Apply customizations if provided
    if (customizations) {
      return {
        ...template,
        ...customizations,
        id: this.generateId(),
        updatedAt: new Date(),
      };
    }

    return template;
  }

  /**
   * Validate form data against template rules
   */
  public validateFormData(
    templateId: string,
    data: Record<string, any>,
  ): {
    isValid: boolean;
    errors: ValidationError[];
  } {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        isValid: false,
        errors: [
          {
            field: "form",
            message: "Form template not found",
            type: "template",
          },
        ],
      };
    }

    const errors: ValidationError[] = [];

    // Validate each field
    template.fields.forEach((field) => {
      const value = data[field.id];
      const fieldErrors = this.validateField(field, value, data);
      errors.push(...fieldErrors);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Submit form data
   */
  public submitForm(
    templateId: string,
    data: Record<string, any>,
    metadata: any,
  ): FormSubmission {
    const validation = this.validateFormData(templateId, data);

    const submission: FormSubmission = {
      formId: templateId,
      data,
      metadata: {
        submittedAt: new Date(),
        submittedBy: metadata.userId || "anonymous",
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        sessionId: metadata.sessionId,
      },
      validation,
    };

    // Store submission
    if (!this.submissions.has(templateId)) {
      this.submissions.set(templateId, []);
    }
    this.submissions.get(templateId)!.push(submission);

    return submission;
  }

  /**
   * Get all form templates
   */
  public getTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  public getTemplate(id: string): FormTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get form submissions
   */
  public getSubmissions(templateId: string): FormSubmission[] {
    return this.submissions.get(templateId) || [];
  }

  /**
   * Generate smart form based on context
   */
  public generateSmartForm(context: {
    patientType?: string;
    clinicalArea?: string;
    assessmentType?: string;
    complianceRequirements?: string[];
  }): FormTemplate {
    // AI-driven form generation based on context
    const fields: FormField[] = [];

    // Add common patient information fields
    fields.push(
      {
        id: "patient_name",
        type: "text",
        label: "Patient Name",
        required: true,
        validation: [{ type: "required", message: "Patient name is required" }],
      },
      {
        id: "patient_id",
        type: "text",
        label: "Patient ID",
        required: true,
        validation: [{ type: "required", message: "Patient ID is required" }],
      },
      {
        id: "assessment_date",
        type: "date",
        label: "Assessment Date",
        required: true,
        defaultValue: new Date().toISOString().split("T")[0],
      },
    );

    // Add context-specific fields
    if (context.clinicalArea === "cardiac") {
      fields.push(
        {
          id: "heart_rate",
          type: "number",
          label: "Heart Rate (bpm)",
          required: true,
          validation: [
            { type: "required", message: "Heart rate is required" },
            {
              type: "custom",
              message: "Heart rate must be between 40-200 bpm",
              customValidator: (value) => value >= 40 && value <= 200,
            },
          ],
        },
        {
          id: "blood_pressure_systolic",
          type: "number",
          label: "Blood Pressure - Systolic",
          required: true,
        },
        {
          id: "blood_pressure_diastolic",
          type: "number",
          label: "Blood Pressure - Diastolic",
          required: true,
        },
      );
    }

    if (context.assessmentType === "initial") {
      fields.push(
        {
          id: "chief_complaint",
          type: "textarea",
          label: "Chief Complaint",
          required: true,
          validation: [
            {
              type: "minLength",
              value: 10,
              message: "Please provide detailed chief complaint",
            },
          ],
        },
        {
          id: "medical_history",
          type: "textarea",
          label: "Medical History",
          required: true,
        },
      );
    }

    // Add signature field for compliance
    if (context.complianceRequirements?.includes("signature")) {
      fields.push({
        id: "clinician_signature",
        type: "signature",
        label: "Clinician Signature",
        required: true,
        validation: [
          { type: "required", message: "Clinician signature is required" },
        ],
      });
    }

    return this.createTemplate({
      name: `Smart ${context.clinicalArea || "Clinical"} ${context.assessmentType || "Assessment"} Form`,
      description: `Dynamically generated form for ${context.clinicalArea || "clinical"} ${context.assessmentType || "assessment"}`,
      category: context.clinicalArea || "general",
      fields,
      layout: {
        type: "single-column",
        responsive: true,
      },
      styling: {
        theme: "clinical",
        fieldSpacing: "normal",
        labelPosition: "top",
      },
      metadata: {
        generatedBy: "SmartFormEngine",
        context,
      },
      version: "1.0",
    });
  }

  /**
   * Load default clinical form templates
   */
  private async loadDefaultTemplates(): Promise<void> {
    // Initial Assessment Form
    this.createTemplate({
      name: "Initial Assessment Form",
      description: "Comprehensive initial patient assessment",
      category: "clinical",
      fields: [
        {
          id: "patient_name",
          type: "text",
          label: "Patient Name",
          required: true,
          validation: [
            { type: "required", message: "Patient name is required" },
          ],
        },
        {
          id: "date_of_birth",
          type: "date",
          label: "Date of Birth",
          required: true,
        },
        {
          id: "gender",
          type: "select",
          label: "Gender",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "chief_complaint",
          type: "textarea",
          label: "Chief Complaint",
          required: true,
          validation: [
            {
              type: "minLength",
              value: 10,
              message: "Please provide detailed chief complaint",
            },
          ],
        },
        {
          id: "vital_signs_temperature",
          type: "number",
          label: "Temperature (°C)",
          required: true,
        },
        {
          id: "vital_signs_pulse",
          type: "number",
          label: "Pulse Rate (bpm)",
          required: true,
        },
        {
          id: "clinician_signature",
          type: "signature",
          label: "Clinician Signature",
          required: true,
        },
      ],
      layout: {
        type: "single-column",
        responsive: true,
        sections: [
          {
            id: "patient_info",
            title: "Patient Information",
            fields: ["patient_name", "date_of_birth", "gender"],
          },
          {
            id: "assessment",
            title: "Clinical Assessment",
            fields: [
              "chief_complaint",
              "vital_signs_temperature",
              "vital_signs_pulse",
            ],
          },
          {
            id: "signature",
            title: "Verification",
            fields: ["clinician_signature"],
          },
        ],
      },
      styling: {
        theme: "clinical",
        fieldSpacing: "normal",
        labelPosition: "top",
      },
      metadata: {
        dohCompliant: true,
        jawdaCompliant: true,
      },
      version: "1.0",
    });

    // Medication Reconciliation Form
    this.createTemplate({
      name: "Medication Reconciliation Form",
      description: "Comprehensive medication review and reconciliation",
      category: "medication",
      fields: [
        {
          id: "patient_id",
          type: "text",
          label: "Patient ID",
          required: true,
        },
        {
          id: "reconciliation_date",
          type: "date",
          label: "Reconciliation Date",
          required: true,
          defaultValue: new Date().toISOString().split("T")[0],
        },
        {
          id: "current_medications",
          type: "textarea",
          label: "Current Medications",
          required: true,
          placeholder: "List all current medications with dosages",
        },
        {
          id: "allergies",
          type: "textarea",
          label: "Known Allergies",
          required: false,
          placeholder: "List any known drug allergies",
        },
        {
          id: "pharmacist_signature",
          type: "signature",
          label: "Pharmacist Signature",
          required: true,
        },
      ],
      layout: {
        type: "single-column",
        responsive: true,
      },
      styling: {
        theme: "clinical",
        fieldSpacing: "normal",
        labelPosition: "top",
      },
      metadata: {
        dohCompliant: true,
      },
      version: "1.0",
    });

    console.log("✅ Default form templates loaded");
  }

  /**
   * Validate individual field
   */
  private validateField(
    field: FormField,
    value: any,
    allData: Record<string, any>,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required validation
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field: field.id,
        message: `${field.label} is required`,
        type: "required",
      });
      return errors; // Don't continue validation if required field is empty
    }

    // Apply validation rules
    if (
      field.validation &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      field.validation.forEach((rule) => {
        switch (rule.type) {
          case "minLength":
            if (typeof value === "string" && value.length < rule.value) {
              errors.push({
                field: field.id,
                message: rule.message,
                type: "minLength",
              });
            }
            break;
          case "maxLength":
            if (typeof value === "string" && value.length > rule.value) {
              errors.push({
                field: field.id,
                message: rule.message,
                type: "maxLength",
              });
            }
            break;
          case "pattern":
            if (
              typeof value === "string" &&
              !new RegExp(rule.value).test(value)
            ) {
              errors.push({
                field: field.id,
                message: rule.message,
                type: "pattern",
              });
            }
            break;
          case "custom":
            if (rule.customValidator && !rule.customValidator(value)) {
              errors.push({
                field: field.id,
                message: rule.message,
                type: "custom",
              });
            }
            break;
        }
      });
    }

    return errors;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const formGenerationEngine = FormGenerationEngine.getInstance();
export default formGenerationEngine;
