/**
 * Environment Configuration Validator
 * Ensures all required environment variables are properly configured
 */

interface EnvironmentConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  apiBaseUrl?: string;
  buildVersion?: string;
  nodeEnv?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private validationResult: ValidationResult | null = null;

  private constructor() {}

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  /**
   * Get environment variable from multiple sources
   */
  private getEnvVar(key: string): string | undefined {
    // Check process.env (Node.js/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    
    // Check import.meta.env (Vite)
    if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    
    // Check window.env (runtime injection)
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
      return (window as any).env[key];
    }
    
    return undefined;
  }

  /**
   * Validate all environment variables
   */
  public validate(): ValidationResult {
    if (this.validationResult) {
      return this.validationResult;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const config: EnvironmentConfig = {};

    // Required variables
    const requiredVars = [
      { key: 'VITE_SUPABASE_URL', configKey: 'supabaseUrl' },
      { key: 'VITE_SUPABASE_ANON_KEY', configKey: 'supabaseAnonKey' }
    ];

    // Optional but recommended variables
    const optionalVars = [
      { key: 'VITE_SUPABASE_SERVICE_ROLE_KEY', configKey: 'supabaseServiceRoleKey' },
      { key: 'VITE_API_BASE_URL', configKey: 'apiBaseUrl' },
      { key: 'VITE_BUILD_VERSION', configKey: 'buildVersion' },
      { key: 'NODE_ENV', configKey: 'nodeEnv' }
    ];

    // Validate required variables
    for (const { key, configKey } of requiredVars) {
      const value = this.getEnvVar(key);
      if (!value) {
        errors.push(`Missing required environment variable: ${key}`);
      } else {
        config[configKey as keyof EnvironmentConfig] = value;
        // Validate URL format for URL variables
        if (key.includes('URL') && !this.isValidUrl(value)) {
          errors.push(`Invalid URL format for ${key}: ${value}`);
        }
      }
    }

    // Validate optional variables
    for (const { key, configKey } of optionalVars) {
      const value = this.getEnvVar(key);
      if (value) {
        config[configKey as keyof EnvironmentConfig] = value;
        // Validate URL format for URL variables
        if (key.includes('URL') && !this.isValidUrl(value)) {
          warnings.push(`Invalid URL format for ${key}: ${value}`);
        }
      } else {
        warnings.push(`Optional environment variable not set: ${key}`);
      }
    }

    // Environment-specific validations
    const nodeEnv = config.nodeEnv || 'development';
    if (nodeEnv === 'production') {
      if (!config.supabaseServiceRoleKey) {
        warnings.push('VITE_SUPABASE_SERVICE_ROLE_KEY recommended for production');
      }
      if (!config.apiBaseUrl) {
        warnings.push('VITE_API_BASE_URL should be set for production');
      }
    }

    this.validationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      config
    };

    // Log validation results
    if (errors.length > 0) {
      console.error('❌ Environment validation failed:', errors);
    }
    if (warnings.length > 0) {
      console.warn('⚠️ Environment validation warnings:', warnings);
    }
    if (errors.length === 0) {
      console.log('✅ Environment validation passed');
    }

    return this.validationResult;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get validated configuration
   */
  public getConfig(): EnvironmentConfig {
    const result = this.validate();
    return result.config;
  }

  /**
   * Check if environment is properly configured
   */
  public isConfigured(): boolean {
    const result = this.validate();
    return result.isValid;
  }

  /**
   * Get environment status report
   */
  public getStatusReport(): {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details: ValidationResult;
  } {
    const result = this.validate();
    
    if (result.errors.length > 0) {
      return {
        status: 'error',
        message: `Environment configuration has ${result.errors.length} error(s)`,
        details: result
      };
    }
    
    if (result.warnings.length > 0) {
      return {
        status: 'warning',
        message: `Environment configuration has ${result.warnings.length} warning(s)`,
        details: result
      };
    }
    
    return {
      status: 'healthy',
      message: 'Environment configuration is healthy',
      details: result
    };
  }

  /**
   * Reset validation cache (useful for testing)
   */
  public reset(): void {
    this.validationResult = null;
  }
}

export const environmentValidator = EnvironmentValidator.getInstance();
export default environmentValidator;
