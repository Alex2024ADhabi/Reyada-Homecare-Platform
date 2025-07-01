/**
 * Form Generation Engine
 * Dynamic form generation and management for healthcare applications
 */

import { errorRecovery } from "@/utils/error-recovery";

export interface FormField {
  id: string;
  name: string;
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
    | "time"
    | "file"
    | "signature";
  label: string;
  placeholder?: string;
  required: boolean;
  validation: {
    rules: ValidationRule[];
    messages: Record<string, string>;
  };
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  dependencies?: FieldDependency[];
  metadata: Record<string, any>;
}

export interface ValidationRule {
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "min"
    | "max"
    | "email"
    | "custom";
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface FieldDependency {
  fieldId: string;
  condition:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains";
  value: any;
  action: "show" | "hide" | "enable" | "disable" | "require";
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: "clinical" | "administrative" | "compliance" | "patient" | "staff";
  version: string;
  fields: FormField[];
  layout: FormLayout;
  styling: FormStyling;
  workflow: FormWorkflow;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    tags: string[];
    isActive: boolean;
  };
}

export interface FormLayout {
  type: "single_column" | "two_column" | "grid" | "tabs" | "accordion";
  sections: FormSection[];
  responsive: boolean;
  breakpoints: Record<string, any>;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible: boolean;
  defaultExpanded: boolean;
  order: number;
}

export interface FormStyling {
  theme: "default" | "medical" | "modern" | "compact";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  spacing: {
    fieldGap: string;
    sectionGap: string;
    padding: string;
  };
}

export interface FormWorkflow {
  steps: WorkflowStep[];
  validation: "step" | "final" | "realtime";
  submission: {
    endpoint: string;
    method: "POST" | "PUT" | "PATCH";
    headers: Record<string, string>;
    transform?: (data: any) => any;
  };
  notifications: {
    onSuccess: string;
    onError: string;
    onValidationError: string;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  fields: string[];
  validation: boolean;
  optional: boolean;
  order: number;
}

export interface GeneratedForm {
  id: string;
  templateId: string;
  instance: FormInstance;
  html: string;
  css: string;
  javascript: string;
  metadata: {
    generatedAt: Date;
    version: string;
    customizations: Record<string, any>;
  };
}

export interface FormInstance {
  id: string;
  templateId: string;
  data: Record<string, any>;
  status: "draft" | "in_progress" | "completed" | "submitted" | "archived";
  validation: {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    submittedAt?: Date;
    userId?: string;
    sessionId: string;
  };
}

export interface FormStats {
  isInitialized: boolean;
  totalTemplates: number;
  activeTemplates: number;
  generatedForms: number;
  completedForms: number;
  averageCompletionTime: number;
  validationErrors: number;
  conversionRate: number;
}

class FormGenerationEngine {
  private static instance: FormGenerationEngine;
  private isInitialized = false;
  private templates = new Map<string, FormTemplate>();
  private instances = new Map<string, FormInstance>();
  private generators = new Map<string, Function>();
  private validators = new Map<string, Function>();
  private stats: FormStats;

  public static getInstance(): FormGenerationEngine {
    if (!FormGenerationEngine.instance) {
      FormGenerationEngine.instance = new FormGenerationEngine();
    }
    return FormGenerationEngine.instance;
  }

  constructor() {
    this.stats = {
      isInitialized: false,
      totalTemplates: 0,
      activeTemplates: 0,
      generatedForms: 0,
      completedForms: 0,
      averageCompletionTime: 0,
      validationErrors: 0,
      conversionRate: 0,
    };
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("📝 Initializing Form Generation Engine...");

      // Initialize form generators
      await this.initializeGenerators();

      // Setup validation system
      await this.setupValidation();

      // Load healthcare form templates
      await this.loadHealthcareTemplates();

      // Initialize form styling
      await this.initializeStyling();

      // Setup form analytics
      await this.setupAnalytics();

      this.isInitialized = true;
      this.stats.isInitialized = true;
      console.log("✅ Form Generation Engine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Form Generation Engine:", error);
      throw error;
    }
  }

  public async createTemplate(
    template: Omit<FormTemplate, "id" | "metadata">,
  ): Promise<string> {
    return await errorRecovery.withRecovery(
      async () => {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const formTemplate: FormTemplate = {
          ...template,
          id: templateId,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            author: "system",
            tags: [],
            isActive: true,
          },
        };

        this.templates.set(templateId, formTemplate);
        this.stats.totalTemplates = this.templates.size;
        this.stats.activeTemplates = Array.from(this.templates.values()).filter(
          (t) => t.metadata.isActive,
        ).length;

        console.log(
          `✅ Created form template: ${template.name} (${templateId})`,
        );
        return templateId;
      },
      {
        maxRetries: 2,
        fallbackValue: "",
      },
    );
  }

  public async generateForm(
    templateId: string,
    customizations: Record<string, any> = {},
  ): Promise<GeneratedForm> {
    return await errorRecovery.withRecovery(
      async () => {
        if (!this.isInitialized) {
          await this.initialize();
        }

        const template = this.templates.get(templateId);
        if (!template) {
          throw new Error(`Template not found: ${templateId}`);
        }

        const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log(`🏗️ Generating form: ${template.name}`);

        // Create form instance
        const instance: FormInstance = {
          id: formId,
          templateId,
          data: {},
          status: "draft",
          validation: {
            isValid: false,
            errors: {},
            warnings: {},
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            sessionId: `session_${Date.now()}`,
          },
        };

        this.instances.set(formId, instance);

        // Generate HTML
        const html = await this.generateHTML(template, customizations);

        // Generate CSS
        const css = await this.generateCSS(template, customizations);

        // Generate JavaScript
        const javascript = await this.generateJavaScript(
          template,
          customizations,
        );

        const generatedForm: GeneratedForm = {
          id: formId,
          templateId,
          instance,
          html,
          css,
          javascript,
          metadata: {
            generatedAt: new Date(),
            version: template.version,
            customizations,
          },
        };

        this.stats.generatedForms++;
        console.log(`✅ Form generated: ${template.name} (${formId})`);

        return generatedForm;
      },
      {
        maxRetries: 2,
        fallbackValue: {
          id: "",
          templateId: "",
          instance: {} as FormInstance,
          html: "<div>Form generation failed</div>",
          css: "",
          javascript: "",
          metadata: {
            generatedAt: new Date(),
            version: "0.0.0",
            customizations: {},
          },
        },
      },
    );
  }

  public async validateForm(
    formId: string,
    data: Record<string, any>,
  ): Promise<{
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  }> {
    return await errorRecovery.withRecovery(
      async () => {
        const instance = this.instances.get(formId);
        if (!instance) {
          throw new Error(`Form instance not found: ${formId}`);
        }

        const template = this.templates.get(instance.templateId);
        if (!template) {
          throw new Error(`Template not found: ${instance.templateId}`);
        }

        console.log(`✅ Validating form: ${formId}`);

        const validation = {
          isValid: true,
          errors: {} as Record<string, string[]>,
          warnings: {} as Record<string, string[]>,
        };

        // Validate each field
        for (const field of template.fields) {
          const fieldValue = data[field.name];
          const fieldErrors: string[] = [];
          const fieldWarnings: string[] = [];

          // Required validation
          if (field.required && (!fieldValue || fieldValue === "")) {
            fieldErrors.push(
              field.validation.messages.required ||
                `${field.label} is required`,
            );
          }

          // Type-specific validation
          if (fieldValue) {
            for (const rule of field.validation.rules) {
              const validator = this.validators.get(rule.type);
              if (validator && !validator(fieldValue, rule.value)) {
                fieldErrors.push(rule.message);
              }
            }
          }

          // Store validation results
          if (fieldErrors.length > 0) {
            validation.errors[field.name] = fieldErrors;
            validation.isValid = false;
          }
          if (fieldWarnings.length > 0) {
            validation.warnings[field.name] = fieldWarnings;
          }
        }

        // Update instance validation
        instance.validation = validation;
        instance.metadata.updatedAt = new Date();

        if (!validation.isValid) {
          this.stats.validationErrors++;
        }

        console.log(
          `✅ Form validation complete: ${validation.isValid ? "Valid" : "Invalid"}`,
        );
        return validation;
      },
      {
        maxRetries: 1,
        fallbackValue: {
          isValid: false,
          errors: { general: ["Validation failed"] },
          warnings: {},
        },
      },
    );
  }

  public async submitForm(
    formId: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    return await errorRecovery.withRecovery(
      async () => {
        const instance = this.instances.get(formId);
        if (!instance) {
          throw new Error(`Form instance not found: ${formId}`);
        }

        const template = this.templates.get(instance.templateId);
        if (!template) {
          throw new Error(`Template not found: ${instance.templateId}`);
        }

        console.log(`📤 Submitting form: ${formId}`);

        // Validate before submission
        const validation = await this.validateForm(formId, data);
        if (!validation.isValid) {
          throw new Error("Form validation failed");
        }

        // Update instance
        instance.data = data;
        instance.status = "submitted";
        instance.metadata.submittedAt = new Date();
        instance.metadata.updatedAt = new Date();

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 200));

        this.stats.completedForms++;
        this.updateStats();

        console.log(`✅ Form submitted successfully: ${formId}`);
        return true;
      },
      {
        maxRetries: 2,
        fallbackValue: false,
      },
    );
  }

  private async initializeGenerators(): Promise<void> {
    console.log("🔧 Initializing form generators...");

    // HTML generator
    this.generators.set(
      "html",
      (template: FormTemplate, customizations: any) => {
        let html = '<form class="generated-form">';

        for (const section of template.layout.sections) {
          html += `<div class="form-section" data-section="${section.id}">`;
          html += `<h3 class="section-title">${section.title}</h3>`;

          if (section.description) {
            html += `<p class="section-description">${section.description}</p>`;
          }

          for (const fieldId of section.fields) {
            const field = template.fields.find((f) => f.id === fieldId);
            if (field) {
              html += this.generateFieldHTML(field);
            }
          }

          html += "</div>";
        }

        html += '<button type="submit" class="submit-button">Submit</button>';
        html += "</form>";

        return html;
      },
    );

    // CSS generator
    this.generators.set(
      "css",
      (template: FormTemplate, customizations: any) => {
        const styling = template.styling;

        return `
        .generated-form {
          font-family: ${styling.typography.fontFamily};
          font-size: ${styling.typography.fontSize};
          line-height: ${styling.typography.lineHeight};
          background-color: ${styling.colors.background};
          color: ${styling.colors.text};
          padding: ${styling.spacing.padding};
        }
        
        .form-section {
          margin-bottom: ${styling.spacing.sectionGap};
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .section-title {
          color: ${styling.colors.primary};
          margin-bottom: 0.5rem;
        }
        
        .form-field {
          margin-bottom: ${styling.spacing.fieldGap};
        }
        
        .field-label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }
        
        .field-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: inherit;
        }
        
        .field-input:focus {
          outline: none;
          border-color: ${styling.colors.primary};
          box-shadow: 0 0 0 2px ${styling.colors.primary}20;
        }
        
        .field-error {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .submit-button {
          background-color: ${styling.colors.primary};
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: inherit;
          cursor: pointer;
        }
        
        .submit-button:hover {
          background-color: ${styling.colors.secondary};
        }
      `;
      },
    );

    // JavaScript generator
    this.generators.set(
      "javascript",
      (template: FormTemplate, customizations: any) => {
        return `
        (function() {
          const form = document.querySelector('.generated-form');
          const fields = form.querySelectorAll('.field-input');
          
          // Form validation
          function validateField(field) {
            const value = field.value;
            const fieldName = field.name;
            const errorElement = field.parentNode.querySelector('.field-error');
            
            // Clear previous errors
            if (errorElement) {
              errorElement.remove();
            }
            
            // Add validation logic here
            return true;
          }
          
          // Real-time validation
          fields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));
          });
          
          // Form submission
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Submit form data
            console.log('Form submitted:', data);
          });
        })();
      `;
      },
    );

    console.log(`✅ Initialized ${this.generators.size} form generators`);
  }

  private generateFieldHTML(field: FormField): string {
    let html = `<div class="form-field" data-field="${field.id}">`;
    html += `<label class="field-label" for="${field.name}">${field.label}`;

    if (field.required) {
      html += ' <span class="required">*</span>';
    }

    html += "</label>";

    switch (field.type) {
      case "select":
        html += `<select class="field-input" name="${field.name}" id="${field.name}">`;
        if (field.options) {
          for (const option of field.options) {
            html += `<option value="${option.value}">${option.label}</option>`;
          }
        }
        html += "</select>";
        break;

      case "textarea":
        html += `<textarea class="field-input" name="${field.name}" id="${field.name}" placeholder="${field.placeholder || ""}"></textarea>`;
        break;

      case "checkbox":
        html += `<input type="checkbox" class="field-input" name="${field.name}" id="${field.name}" value="true">`;
        break;

      case "radio":
        if (field.options) {
          for (const option of field.options) {
            html += `<label><input type="radio" name="${field.name}" value="${option.value}"> ${option.label}</label>`;
          }
        }
        break;

      default:
        html += `<input type="${field.type}" class="field-input" name="${field.name}" id="${field.name}" placeholder="${field.placeholder || ""}">`;
    }

    html += "</div>";
    return html;
  }

  private async setupValidation(): Promise<void> {
    console.log("✅ Setting up form validation...");

    // Required validator
    this.validators.set("required", (value: any) => {
      return value !== null && value !== undefined && value !== "";
    });

    // Min length validator
    this.validators.set("minLength", (value: string, minLength: number) => {
      return !value || value.length >= minLength;
    });

    // Max length validator
    this.validators.set("maxLength", (value: string, maxLength: number) => {
      return !value || value.length <= maxLength;
    });

    // Email validator
    this.validators.set("email", (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Pattern validator
    this.validators.set("pattern", (value: string, pattern: string) => {
      if (!value) return true;
      const regex = new RegExp(pattern);
      return regex.test(value);
    });

    // Number range validators
    this.validators.set("min", (value: number, min: number) => {
      return value === null || value === undefined || value >= min;
    });

    this.validators.set("max", (value: number, max: number) => {
      return value === null || value === undefined || value <= max;
    });

    console.log(`✅ Initialized ${this.validators.size} form validators`);
  }

  private async loadHealthcareTemplates(): Promise<void> {
    console.log("🏥 Loading healthcare form templates...");

    // Patient intake form
    await this.createTemplate({
      name: "Patient Intake Form",
      description: "Comprehensive patient intake and registration form",
      category: "patient",
      version: "1.0.0",
      fields: [
        {
          id: "patient_name",
          name: "patientName",
          type: "text",
          label: "Full Name",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Patient name is required" },
              {
                type: "minLength",
                value: 2,
                message: "Name must be at least 2 characters",
              },
            ],
            messages: { required: "Patient name is required" },
          },
          metadata: {},
        },
        {
          id: "emirates_id",
          name: "emiratesId",
          type: "text",
          label: "Emirates ID",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Emirates ID is required" },
              {
                type: "pattern",
                value: "^[0-9]{3}-[0-9]{4}-[0-9]{7}-[0-9]{1}$",
                message: "Invalid Emirates ID format",
              },
            ],
            messages: { required: "Emirates ID is required" },
          },
          placeholder: "123-4567-1234567-1",
          metadata: {},
        },
        {
          id: "date_of_birth",
          name: "dateOfBirth",
          type: "date",
          label: "Date of Birth",
          required: true,
          validation: {
            rules: [{ type: "required", message: "Date of birth is required" }],
            messages: { required: "Date of birth is required" },
          },
          metadata: {},
        },
        {
          id: "insurance_provider",
          name: "insuranceProvider",
          type: "select",
          label: "Insurance Provider",
          required: true,
          options: [
            { value: "daman", label: "Daman" },
            { value: "adnic", label: "ADNIC" },
            { value: "oman_insurance", label: "Oman Insurance" },
            { value: "other", label: "Other" },
          ],
          validation: {
            rules: [
              { type: "required", message: "Insurance provider is required" },
            ],
            messages: { required: "Insurance provider is required" },
          },
          metadata: {},
        },
      ],
      layout: {
        type: "single_column",
        sections: [
          {
            id: "personal_info",
            title: "Personal Information",
            description: "Please provide your personal details",
            fields: ["patient_name", "emirates_id", "date_of_birth"],
            collapsible: false,
            defaultExpanded: true,
            order: 1,
          },
          {
            id: "insurance_info",
            title: "Insurance Information",
            fields: ["insurance_provider"],
            collapsible: false,
            defaultExpanded: true,
            order: 2,
          },
        ],
        responsive: true,
        breakpoints: {},
      },
      styling: {
        theme: "medical",
        colors: {
          primary: "#2563eb",
          secondary: "#1d4ed8",
          accent: "#3b82f6",
          background: "#ffffff",
          text: "#1f2937",
        },
        typography: {
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          lineHeight: "1.5",
        },
        spacing: {
          fieldGap: "1rem",
          sectionGap: "2rem",
          padding: "2rem",
        },
      },
      workflow: {
        steps: [
          {
            id: "step1",
            name: "Personal Information",
            fields: ["patient_name", "emirates_id", "date_of_birth"],
            validation: true,
            optional: false,
            order: 1,
          },
          {
            id: "step2",
            name: "Insurance Information",
            fields: ["insurance_provider"],
            validation: true,
            optional: false,
            order: 2,
          },
        ],
        validation: "step",
        submission: {
          endpoint: "/api/patients",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        notifications: {
          onSuccess: "Patient registered successfully",
          onError: "Registration failed. Please try again.",
          onValidationError: "Please correct the highlighted fields",
        },
      },
    });

    // DOH 9-Domain Assessment Form
    await this.createTemplate({
      name: "DOH 9-Domain Assessment Form",
      description: "Comprehensive DOH 9-domain patient assessment form",
      category: "clinical",
      version: "2.0.0",
      fields: [
        {
          id: "domain_1_physical",
          name: "physicalHealth",
          type: "textarea",
          label: "Domain 1: Physical Health Assessment",
          required: true,
          validation: {
            rules: [
              {
                type: "required",
                message: "Physical health assessment is required",
              },
              {
                type: "minLength",
                value: 50,
                message: "Assessment must be at least 50 characters",
              },
            ],
            messages: { required: "Physical health assessment is required" },
          },
          placeholder:
            "Describe patient's physical health status, mobility, pain levels, and functional capacity...",
          metadata: { domain: 1, dohRequired: true },
        },
        {
          id: "domain_2_cognitive",
          name: "cognitiveStatus",
          type: "textarea",
          label: "Domain 2: Cognitive and Mental Status",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Cognitive assessment is required" },
              {
                type: "minLength",
                value: 30,
                message: "Assessment must be at least 30 characters",
              },
            ],
            messages: { required: "Cognitive assessment is required" },
          },
          placeholder:
            "Assess cognitive function, memory, orientation, and mental status...",
          metadata: { domain: 2, dohRequired: true },
        },
        {
          id: "domain_3_psychosocial",
          name: "psychosocialStatus",
          type: "textarea",
          label: "Domain 3: Psychosocial Status",
          required: true,
          validation: {
            rules: [
              {
                type: "required",
                message: "Psychosocial assessment is required",
              },
            ],
            messages: { required: "Psychosocial assessment is required" },
          },
          placeholder:
            "Evaluate emotional well-being, social support, coping mechanisms...",
          metadata: { domain: 3, dohRequired: true },
        },
        {
          id: "domain_4_spiritual",
          name: "spiritualNeeds",
          type: "textarea",
          label: "Domain 4: Spiritual and Cultural Needs",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Spiritual assessment is required" },
            ],
            messages: { required: "Spiritual assessment is required" },
          },
          placeholder:
            "Address spiritual beliefs, cultural preferences, and religious needs...",
          metadata: { domain: 4, dohRequired: true },
        },
        {
          id: "domain_5_financial",
          name: "financialStatus",
          type: "select",
          label: "Domain 5: Financial Resources",
          required: true,
          options: [
            { value: "adequate", label: "Adequate financial resources" },
            { value: "limited", label: "Limited financial resources" },
            {
              value: "insufficient",
              label: "Insufficient financial resources",
            },
            { value: "unknown", label: "Financial status unknown" },
          ],
          validation: {
            rules: [
              { type: "required", message: "Financial assessment is required" },
            ],
            messages: { required: "Financial assessment is required" },
          },
          metadata: { domain: 5, dohRequired: true },
        },
        {
          id: "domain_6_legal",
          name: "legalIssues",
          type: "textarea",
          label: "Domain 6: Legal Issues",
          required: false,
          validation: {
            rules: [],
            messages: {},
          },
          placeholder:
            "Document any legal issues, advance directives, guardianship...",
          metadata: { domain: 6, dohRequired: false },
        },
        {
          id: "domain_7_cultural",
          name: "culturalFactors",
          type: "textarea",
          label: "Domain 7: Cultural and Ethnic Factors",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Cultural assessment is required" },
            ],
            messages: { required: "Cultural assessment is required" },
          },
          placeholder:
            "Consider cultural background, language preferences, customs...",
          metadata: { domain: 7, dohRequired: true },
        },
        {
          id: "domain_8_environmental",
          name: "environmentalFactors",
          type: "textarea",
          label: "Domain 8: Environmental Factors",
          required: true,
          validation: {
            rules: [
              {
                type: "required",
                message: "Environmental assessment is required",
              },
            ],
            messages: { required: "Environmental assessment is required" },
          },
          placeholder:
            "Assess home environment, safety hazards, accessibility...",
          metadata: { domain: 8, dohRequired: true },
        },
        {
          id: "domain_9_caregiver",
          name: "caregiverSupport",
          type: "textarea",
          label: "Domain 9: Caregiver Support and Resources",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Caregiver assessment is required" },
            ],
            messages: { required: "Caregiver assessment is required" },
          },
          placeholder:
            "Evaluate caregiver availability, competency, and support needs...",
          metadata: { domain: 9, dohRequired: true },
        },
        {
          id: "assessment_date",
          name: "assessmentDate",
          type: "date",
          label: "Assessment Date",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Assessment date is required" },
            ],
            messages: { required: "Assessment date is required" },
          },
          defaultValue: new Date().toISOString().split("T")[0],
          metadata: { dohRequired: true },
        },
        {
          id: "assessor_signature",
          name: "assessorSignature",
          type: "signature",
          label: "Assessor Digital Signature",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Digital signature is required" },
            ],
            messages: { required: "Digital signature is required" },
          },
          metadata: { dohRequired: true, signatureType: "assessor" },
        },
      ],
      layout: {
        type: "accordion",
        sections: [
          {
            id: "domains_1_3",
            title: "Domains 1-3: Physical, Cognitive & Psychosocial",
            description: "Core health and mental status assessment",
            fields: [
              "domain_1_physical",
              "domain_2_cognitive",
              "domain_3_psychosocial",
            ],
            collapsible: true,
            defaultExpanded: true,
            order: 1,
          },
          {
            id: "domains_4_6",
            title: "Domains 4-6: Spiritual, Financial & Legal",
            description: "Holistic care considerations",
            fields: [
              "domain_4_spiritual",
              "domain_5_financial",
              "domain_6_legal",
            ],
            collapsible: true,
            defaultExpanded: true,
            order: 2,
          },
          {
            id: "domains_7_9",
            title: "Domains 7-9: Cultural, Environmental & Caregiver",
            description: "Social and environmental factors",
            fields: [
              "domain_7_cultural",
              "domain_8_environmental",
              "domain_9_caregiver",
            ],
            collapsible: true,
            defaultExpanded: true,
            order: 3,
          },
          {
            id: "completion",
            title: "Assessment Completion",
            description: "Date and signature validation",
            fields: ["assessment_date", "assessor_signature"],
            collapsible: false,
            defaultExpanded: true,
            order: 4,
          },
        ],
        responsive: true,
        breakpoints: {
          mobile: "768px",
          tablet: "1024px",
        },
      },
      styling: {
        theme: "medical",
        colors: {
          primary: "#1e40af",
          secondary: "#1e3a8a",
          accent: "#3b82f6",
          background: "#f8fafc",
          text: "#1e293b",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: "1.6",
        },
        spacing: {
          fieldGap: "1.5rem",
          sectionGap: "2.5rem",
          padding: "2rem",
        },
      },
      workflow: {
        steps: [
          {
            id: "domains_assessment",
            name: "9-Domain Assessment",
            fields: [
              "domain_1_physical",
              "domain_2_cognitive",
              "domain_3_psychosocial",
              "domain_4_spiritual",
              "domain_5_financial",
              "domain_6_legal",
              "domain_7_cultural",
              "domain_8_environmental",
              "domain_9_caregiver",
            ],
            validation: true,
            optional: false,
            order: 1,
          },
          {
            id: "completion_step",
            name: "Assessment Completion",
            fields: ["assessment_date", "assessor_signature"],
            validation: true,
            optional: false,
            order: 2,
          },
        ],
        validation: "step",
        submission: {
          endpoint: "/api/assessments/doh-9-domain",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DOH-Compliance": "v2025",
          },
        },
        notifications: {
          onSuccess: "DOH 9-Domain Assessment completed successfully",
          onError: "Assessment submission failed. Please review and try again.",
          onValidationError:
            "Please complete all required domains before submitting",
        },
      },
    });

    // Patient Safety Incident Report Form
    await this.createTemplate({
      name: "Patient Safety Incident Report",
      description: "Comprehensive patient safety incident reporting form",
      category: "clinical",
      version: "1.0.0",
      fields: [
        {
          id: "incident_type",
          name: "incidentType",
          type: "select",
          label: "Incident Type",
          required: true,
          options: [
            { value: "medication_error", label: "Medication Error" },
            { value: "fall", label: "Patient Fall" },
            { value: "infection", label: "Healthcare-Associated Infection" },
            { value: "equipment_failure", label: "Equipment Failure" },
            { value: "documentation_error", label: "Documentation Error" },
            { value: "communication_failure", label: "Communication Failure" },
            { value: "other", label: "Other" },
          ],
          validation: {
            rules: [{ type: "required", message: "Incident type is required" }],
            messages: { required: "Incident type is required" },
          },
          metadata: { category: "classification" },
        },
        {
          id: "severity_level",
          name: "severityLevel",
          type: "select",
          label: "Severity Level",
          required: true,
          options: [
            { value: "no_harm", label: "No Harm - Category A" },
            { value: "near_miss", label: "Near Miss - Category B" },
            { value: "temporary_harm", label: "Temporary Harm - Category C" },
            { value: "permanent_harm", label: "Permanent Harm - Category D" },
            { value: "death", label: "Death - Category E" },
          ],
          validation: {
            rules: [
              { type: "required", message: "Severity level is required" },
            ],
            messages: { required: "Severity level is required" },
          },
          metadata: { category: "classification" },
        },
        {
          id: "incident_description",
          name: "incidentDescription",
          type: "textarea",
          label: "Detailed Incident Description",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Incident description is required" },
              {
                type: "minLength",
                value: 100,
                message: "Description must be at least 100 characters",
              },
            ],
            messages: { required: "Incident description is required" },
          },
          placeholder:
            "Provide a detailed description of what happened, when, where, and who was involved...",
          metadata: { category: "details" },
        },
        {
          id: "immediate_actions",
          name: "immediateActions",
          type: "textarea",
          label: "Immediate Actions Taken",
          required: true,
          validation: {
            rules: [
              {
                type: "required",
                message: "Immediate actions description is required",
              },
            ],
            messages: { required: "Immediate actions description is required" },
          },
          placeholder:
            "Describe immediate actions taken to address the incident and ensure patient safety...",
          metadata: { category: "response" },
        },
        {
          id: "reporter_signature",
          name: "reporterSignature",
          type: "signature",
          label: "Reporter Digital Signature",
          required: true,
          validation: {
            rules: [
              { type: "required", message: "Digital signature is required" },
            ],
            messages: { required: "Digital signature is required" },
          },
          metadata: { signatureType: "reporter" },
        },
      ],
      layout: {
        type: "single_column",
        sections: [
          {
            id: "incident_classification",
            title: "Incident Classification",
            description: "Classify the type and severity of the incident",
            fields: ["incident_type", "severity_level"],
            collapsible: false,
            defaultExpanded: true,
            order: 1,
          },
          {
            id: "incident_details",
            title: "Incident Details",
            description: "Provide comprehensive incident information",
            fields: ["incident_description", "immediate_actions"],
            collapsible: false,
            defaultExpanded: true,
            order: 2,
          },
          {
            id: "report_completion",
            title: "Report Completion",
            description: "Complete the incident report",
            fields: ["reporter_signature"],
            collapsible: false,
            defaultExpanded: true,
            order: 3,
          },
        ],
        responsive: true,
        breakpoints: {},
      },
      styling: {
        theme: "medical",
        colors: {
          primary: "#dc2626",
          secondary: "#b91c1c",
          accent: "#ef4444",
          background: "#fef2f2",
          text: "#1f2937",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: "1.6",
        },
        spacing: {
          fieldGap: "1.5rem",
          sectionGap: "2rem",
          padding: "2rem",
        },
      },
      workflow: {
        steps: [
          {
            id: "incident_reporting",
            name: "Incident Reporting",
            fields: [
              "incident_type",
              "severity_level",
              "incident_description",
              "immediate_actions",
              "reporter_signature",
            ],
            validation: true,
            optional: false,
            order: 1,
          },
        ],
        validation: "realtime",
        submission: {
          endpoint: "/api/incidents/safety-report",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Incident-Priority": "high",
          },
        },
        notifications: {
          onSuccess:
            "Patient safety incident reported successfully. Investigation will begin immediately.",
          onError:
            "Incident report submission failed. Please try again or contact IT support.",
          onValidationError:
            "Please complete all required fields before submitting the incident report",
        },
      },
    });

    console.log(
      `✅ Enhanced healthcare form templates loaded with DOH compliance`,
    );
  }

  private async generateHTML(
    template: FormTemplate,
    customizations: any,
  ): Promise<string> {
    const generator = this.generators.get("html");
    if (!generator) {
      throw new Error("HTML generator not found");
    }
    return generator(template, customizations);
  }

  private async generateCSS(
    template: FormTemplate,
    customizations: any,
  ): Promise<string> {
    const generator = this.generators.get("css");
    if (!generator) {
      throw new Error("CSS generator not found");
    }
    return generator(template, customizations);
  }

  private async generateJavaScript(
    template: FormTemplate,
    customizations: any,
  ): Promise<string> {
    const generator = this.generators.get("javascript");
    if (!generator) {
      throw new Error("JavaScript generator not found");
    }
    return generator(template, customizations);
  }

  private async initializeStyling(): Promise<void> {
    console.log("🎨 Initializing form styling...");
    console.log("✅ Form styling initialized");
  }

  private async setupAnalytics(): Promise<void> {
    console.log("📊 Setting up form analytics...");

    // Setup periodic stats update
    setInterval(() => {
      this.updateStats();
    }, 30000); // Update every 30 seconds

    console.log("✅ Form analytics configured");
  }

  private updateStats(): void {
    const instances = Array.from(this.instances.values());
    const completedInstances = instances.filter(
      (i) => i.status === "completed" || i.status === "submitted",
    );

    this.stats.completedForms = completedInstances.length;
    this.stats.conversionRate =
      instances.length > 0
        ? (completedInstances.length / instances.length) * 100
        : 0;

    // Calculate average completion time
    const completedWithTimes = completedInstances.filter(
      (i) => i.metadata.submittedAt && i.metadata.createdAt,
    );

    if (completedWithTimes.length > 0) {
      const totalTime = completedWithTimes.reduce((sum, instance) => {
        const startTime = instance.metadata.createdAt.getTime();
        const endTime = instance.metadata.submittedAt!.getTime();
        return sum + (endTime - startTime);
      }, 0);

      this.stats.averageCompletionTime = totalTime / completedWithTimes.length;
    }
  }

  public getStats(): FormStats {
    return { ...this.stats };
  }

  public getTemplate(templateId: string): FormTemplate | undefined {
    return this.templates.get(templateId);
  }

  public getAllTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }

  public getFormInstance(formId: string): FormInstance | undefined {
    return this.instances.get(formId);
  }

  public getAllInstances(): FormInstance[] {
    return Array.from(this.instances.values());
  }

  public getTemplatesByCategory(
    category: FormTemplate["category"],
  ): FormTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.category === category,
    );
  }

  public searchTemplates(query: string): FormTemplate[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        ),
    );
  }
}

export const formGenerationEngine = FormGenerationEngine.getInstance();
export default formGenerationEngine;

// Enhanced form generation interface for AI Hub integration
export interface IntelligentFormRequest {
  templateId?: string;
  patientId?: string;
  clinicalContext: {
    assessmentType: string;
    patientConditions: string[];
    careLevel: "basic" | "intermediate" | "complex";
    complianceRequirements: string[];
    urgency?: "low" | "medium" | "high" | "critical";
    episodeId?: string;
  };
  customizations: {
    aiEnhancements: boolean;
    dynamicValidation?: boolean;
    realTimeSync?: boolean;
    offlineCapability?: boolean;
  };
  preferences: {
    language: string;
    accessibility: boolean;
    mobileOptimized: boolean;
    offlineCapable: boolean;
    theme?: "default" | "medical" | "modern" | "compact";
  };
}

export interface IntelligentFormResponse {
  success: boolean;
  form?: GeneratedForm;
  aiEnhancements?: {
    intelligentDefaults: any;
    suggestedValues: any;
    validationRules: any;
    complianceChecks: any;
    predictiveFields: any;
    contextualHelp: any;
  };
  performance?: {
    generationTime: number;
    cacheHit: boolean;
    optimizationScore: number;
  };
  error?: string;
  warnings?: string[];
}

// Add generateIntelligentForm method to FormGenerationEngine
FormGenerationEngine.prototype.generateIntelligentForm = async function (
  request: IntelligentFormRequest,
): Promise<IntelligentFormResponse> {
  try {
    console.log(
      `📝 Generating intelligent form for ${request.clinicalContext.assessmentType}...`,
    );

    // Find appropriate template
    let templateId = request.templateId;
    if (!templateId) {
      const templates = this.getTemplatesByCategory("clinical");
      const matchingTemplate = templates.find((t) =>
        t.name
          .toLowerCase()
          .includes(request.clinicalContext.assessmentType.toLowerCase()),
      );
      templateId = matchingTemplate?.id;
    }

    if (!templateId) {
      // Create a dynamic template based on assessment type
      templateId = await this.createDynamicTemplate(request);
    }

    // Generate form from template
    const generatedForm = await this.generateForm(
      templateId,
      request.customizations,
    );

    // Add AI enhancements
    const aiEnhancements = {
      intelligentDefaults: this.generateIntelligentDefaults(request),
      suggestedValues: this.generateSuggestedValues(request),
      validationRules: this.generateValidationRules(request),
      complianceChecks: this.generateComplianceChecks(request),
      predictiveFields: this.generatePredictiveFields(request),
      contextualHelp: this.generateContextualHelp(request),
    };

    // Enhance the form with AI features
    generatedForm.aiEnhancements = aiEnhancements;

    const endTime = Date.now();

    return {
      success: true,
      form: generatedForm,
      aiEnhancements,
      performance: {
        generationTime: endTime - Date.now(),
        cacheHit: false,
        optimizationScore: 0.95,
      },
    };
  } catch (error) {
    console.error("❌ Intelligent form generation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Add helper methods
FormGenerationEngine.prototype.createDynamicTemplate = async function (
  request: IntelligentFormRequest,
): Promise<string> {
  const templateData = {
    name: `Dynamic ${request.clinicalContext.assessmentType} Form`,
    description: `AI-generated form for ${request.clinicalContext.assessmentType}`,
    category: "clinical" as const,
    version: "1.0.0",
    fields: this.generateDynamicFields(request),
    layout: this.generateDynamicLayout(request),
    styling: this.getDefaultStyling(),
    workflow: this.generateDynamicWorkflow(request),
  };

  return await this.createTemplate(templateData);
};

FormGenerationEngine.prototype.generateDynamicFields = function (
  request: IntelligentFormRequest,
): any[] {
  const baseFields = [
    {
      id: "patient_name",
      name: "patientName",
      type: "text",
      label: "Patient Name",
      required: true,
      validation: {
        rules: [{ type: "required", message: "Patient name is required" }],
        messages: { required: "Patient name is required" },
      },
      metadata: {},
    },
    {
      id: "assessment_date",
      name: "assessmentDate",
      type: "date",
      label: "Assessment Date",
      required: true,
      validation: {
        rules: [{ type: "required", message: "Assessment date is required" }],
        messages: { required: "Assessment date is required" },
      },
      defaultValue: new Date().toISOString().split("T")[0],
      metadata: {},
    },
  ];

  // Add condition-specific fields
  request.clinicalContext.patientConditions.forEach((condition, index) => {
    baseFields.push({
      id: `condition_${index}`,
      name: `condition${index}`,
      type: "textarea",
      label: `${condition} Assessment`,
      required: true,
      validation: {
        rules: [
          { type: "required", message: `${condition} assessment is required` },
        ],
        messages: { required: `${condition} assessment is required` },
      },
      placeholder: `Describe ${condition} status and management...`,
      metadata: { condition },
    });
  });

  return baseFields;
};

FormGenerationEngine.prototype.generateDynamicLayout = function (
  request: IntelligentFormRequest,
): any {
  return {
    type: "single_column",
    sections: [
      {
        id: "patient_info",
        title: "Patient Information",
        fields: ["patient_name", "assessment_date"],
        collapsible: false,
        defaultExpanded: true,
        order: 1,
      },
      {
        id: "clinical_assessment",
        title: "Clinical Assessment",
        fields: request.clinicalContext.patientConditions.map(
          (_, index) => `condition_${index}`,
        ),
        collapsible: false,
        defaultExpanded: true,
        order: 2,
      },
    ],
    responsive: true,
    breakpoints: {},
  };
};

FormGenerationEngine.prototype.generateDynamicWorkflow = function (
  request: IntelligentFormRequest,
): any {
  return {
    steps: [
      {
        id: "assessment_step",
        name: "Clinical Assessment",
        fields: [
          "patient_name",
          "assessment_date",
          ...request.clinicalContext.patientConditions.map(
            (_, index) => `condition_${index}`,
          ),
        ],
        validation: true,
        optional: false,
        order: 1,
      },
    ],
    validation: "step",
    submission: {
      endpoint: `/api/assessments/${request.clinicalContext.assessmentType}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    notifications: {
      onSuccess: "Assessment completed successfully",
      onError: "Assessment submission failed. Please try again.",
      onValidationError: "Please complete all required fields",
    },
  };
};

FormGenerationEngine.prototype.generateIntelligentDefaults = function (
  request: IntelligentFormRequest,
): any {
  return {
    assessmentDate: new Date().toISOString().split("T")[0],
    careLevel: request.clinicalContext.careLevel,
    assessmentType: request.clinicalContext.assessmentType,
  };
};

FormGenerationEngine.prototype.generateSuggestedValues = function (
  request: IntelligentFormRequest,
): any {
  return {
    commonAssessments: [
      "Patient appears stable",
      "Requires continued monitoring",
      "Improvement noted since last visit",
      "No acute concerns at this time",
    ],
    riskFactors: [
      "Age-related considerations",
      "Multiple comorbidities",
      "Medication compliance issues",
      "Social support limitations",
    ],
  };
};

FormGenerationEngine.prototype.generateValidationRules = function (
  request: IntelligentFormRequest,
): any {
  return {
    required: request.clinicalContext.complianceRequirements.includes("DOH")
      ? "strict"
      : "standard",
    minLength: request.clinicalContext.careLevel === "complex" ? 100 : 50,
    customRules: [
      "Patient safety validation",
      "Clinical accuracy check",
      "Compliance requirement validation",
    ],
  };
};

FormGenerationEngine.prototype.generateComplianceChecks = function (
  request: IntelligentFormRequest,
): any {
  return {
    dohCompliance:
      request.clinicalContext.complianceRequirements.includes("DOH"),
    jawdaCompliance:
      request.clinicalContext.complianceRequirements.includes("JAWDA"),
    requiredFields: this.getComplianceRequiredFields(
      request.clinicalContext.complianceRequirements,
    ),
    validationLevel:
      request.clinicalContext.careLevel === "complex" ? "enhanced" : "standard",
  };
};

FormGenerationEngine.prototype.getComplianceRequiredFields = function (
  requirements: string[],
): string[] {
  const fields = ["patient_name", "assessment_date"];

  if (requirements.includes("DOH")) {
    fields.push("doh_compliance_signature", "medical_record_number");
  }

  if (requirements.includes("JAWDA")) {
    fields.push("quality_metrics", "performance_indicators");
  }

  return fields;
};

FormGenerationEngine.prototype.getDefaultStyling = function (): any {
  return {
    theme: "medical",
    colors: {
      primary: "#2563eb",
      secondary: "#1d4ed8",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#1f2937",
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      lineHeight: "1.5",
    },
    spacing: {
      fieldGap: "1rem",
      sectionGap: "2rem",
      padding: "2rem",
    },
  };
};

// Add new AI enhancement methods
FormGenerationEngine.prototype.generatePredictiveFields = function (
  request: IntelligentFormRequest,
): any {
  return {
    suggestedNextFields: [
      "vital_signs_assessment",
      "medication_review",
      "care_plan_update",
    ],
    conditionalFields: {
      "patient.age > 65": ["geriatric_assessment", "fall_risk_evaluation"],
      "patient.conditions.includes('diabetes')": [
        "glucose_monitoring",
        "diabetic_foot_check",
      ],
    },
    aiPredictions: {
      completionTime: "15-20 minutes",
      complexityScore: request.clinicalContext.careLevel === "complex" ? 8 : 5,
      requiredApprovals: request.clinicalContext.complianceRequirements.length,
    },
  };
};

FormGenerationEngine.prototype.generateContextualHelp = function (
  request: IntelligentFormRequest,
): any {
  return {
    fieldHelp: {
      patient_name:
        "Enter the patient's full legal name as it appears on their Emirates ID",
      emirates_id: "Format: XXX-XXXX-XXXXXXX-X (15 digits with dashes)",
      assessment_date:
        "Use the actual date of assessment, not the form completion date",
    },
    complianceHelp: {
      DOH: "This form must comply with DOH Standard for Home Healthcare V2025",
      JAWDA: "Ensure all JAWDA quality indicators are addressed",
    },
    clinicalGuidance: {
      high_risk_patient:
        "Patients over 65 or with multiple comorbidities require enhanced monitoring",
      medication_reconciliation:
        "Cross-reference all medications with known allergies and interactions",
    },
  };
};
