// Environment Configuration Validator
// Ensures all required environment variables are properly configured

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  TEMPO: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  API_BASE_URL?: string;
  BUILD_VERSION: string;
}

export const REQUIRED_ENV_VARS = {
  development: [
    'NODE_ENV',
    'TEMPO'
  ],
  production: [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'API_BASE_URL'
  ],
  test: [
    'NODE_ENV'
  ]
} as const;

export const OPTIONAL_ENV_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'BUILD_VERSION',
  'TEMPO'
] as const;

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private config: Partial<EnvironmentConfig> = {};
  private validationErrors: string[] = [];
  private validationWarnings: string[] = [];

  private constructor() {
    this.loadEnvironmentVariables();
    this.validateConfiguration();
  }

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  private loadEnvironmentVariables(): void {
    // Load from process.env (Node.js)
    if (typeof process !== 'undefined' && process.env) {
      this.config = {
        NODE_ENV: process.env.NODE_ENV as any,
        TEMPO: process.env.TEMPO || 'false',
        SUPABASE_URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        API_BASE_URL: process.env.API_BASE_URL || process.env.VITE_API_BASE_URL,
        BUILD_VERSION: process.env.BUILD_VERSION || '1.0.0'
      };
    }

    // Load from import.meta.env (Vite)
    if (typeof import !== 'undefined' && import.meta && import.meta.env) {
      this.config = {
        ...this.config,
        NODE_ENV: import.meta.env.NODE_ENV as any,
        TEMPO: import.meta.env.VITE_TEMPO || this.config.TEMPO,
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || this.config.SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || this.config.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || this.config.SUPABASE_SERVICE_ROLE_KEY,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL || this.config.API_BASE_URL,
        BUILD_VERSION: import.meta.env.VITE_BUILD_VERSION || this.config.BUILD_VERSION
      };
    }
  }

  private validateConfiguration(): void {
    const environment = this.config.NODE_ENV || 'development';
    const requiredVars = REQUIRED_ENV_VARS[environment] || REQUIRED_ENV_VARS.development;

    // Check required variables
    for (const varName of requiredVars) {
      const value = this.config[varName as keyof EnvironmentConfig];
      if (!value || value === '') {
        this.validationErrors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Check optional but recommended variables
    if (environment === 'production') {
      if (!this.config.SUPABASE_SERVICE_ROLE_KEY) {
        this.validationWarnings.push('SUPABASE_SERVICE_ROLE_KEY not set - admin operations may be limited');
      }
    }

    // Validate URL formats
    if (this.config.SUPABASE_URL && !this.isValidUrl(this.config.SUPABASE_URL)) {
      this.validationErrors.push('SUPABASE_URL is not a valid URL');
    }

    if (this.config.API_BASE_URL && !this.isValidUrl(this.config.API_BASE_URL)) {
      this.validationErrors.push('API_BASE_URL is not a valid URL');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public getConfig(): Partial<EnvironmentConfig> {
    return { ...this.config };
  }

  public getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  public getValidationWarnings(): string[] {
    return [...this.validationWarnings];
  }

  public isValid(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatusReport(): {
    status: 'valid' | 'warning' | 'error';
    message: string;
    details: {
      errors: string[];
      warnings: string[];
      config: Partial<EnvironmentConfig>;
    };
  } {
    if (this.validationErrors.length > 0) {
      return {
        status: 'error',
        message: `Environment configuration has ${this.validationErrors.length} error(s)`,
        details: {
          errors: this.validationErrors,
          warnings: this.validationWarnings,
          config: this.config
        }
      };
    }

    if (this.validationWarnings.length > 0) {
      return {
        status: 'warning',
        message: `Environment configuration has ${this.validationWarnings.length} warning(s)`,
        details: {
          errors: this.validationErrors,
          warnings: this.validationWarnings,
          config: this.config
        }
      };
    }

    return {
      status: 'valid',
      message: 'Environment configuration is valid',
      details: {
        errors: [],
        warnings: [],
        config: this.config
      }
    };
  }

  public logStatus(): void {
    const report = this.getStatusReport();
    
    if (report.status === 'error') {
      console.error('🚨 Environment Configuration Errors:');
      report.details.errors.forEach(error => console.error(`  ❌ ${error}`));
    }

    if (report.details.warnings.length > 0) {
      console.warn('⚠️ Environment Configuration Warnings:');
      report.details.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`));
    }

    if (report.status === 'valid') {
      console.log('✅ Environment configuration is valid');
    }

    console.log('📋 Current Configuration:', {
      NODE_ENV: this.config.NODE_ENV,
      TEMPO: this.config.TEMPO,
      hasSupabaseUrl: !!this.config.SUPABASE_URL,
      hasSupabaseKey: !!this.config.SUPABASE_ANON_KEY,
      hasServiceKey: !!this.config.SUPABASE_SERVICE_ROLE_KEY,
      hasApiUrl: !!this.config.API_BASE_URL,
      buildVersion: this.config.BUILD_VERSION
    });
  }
}

// Export singleton instance
export const environmentValidator = EnvironmentValidator.getInstance();

// Export configuration getter
export const getEnvironmentConfig = (): Partial<EnvironmentConfig> => {
  return environmentValidator.getConfig();
};

// Export validation status
export const isEnvironmentValid = (): boolean => {
  return environmentValidator.isValid();
};

export default environmentValidator;
