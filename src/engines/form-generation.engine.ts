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

    console.log(`✅ Loaded healthcare form templates`);
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
