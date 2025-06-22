// Build Configuration Management
// Centralized build system configuration and validation

export interface BuildConfig {
  buildSystem: "webpack" | "vite";
  environment: "development" | "production" | "test";
  tempoEnabled: boolean;
  sourceMap: boolean;
  optimization: boolean;
  bundleAnalysis: boolean;
  hotReload: boolean;
  publicPath: string;
  outputPath: string;
  assetsPath: string;
}

export const BUILD_SYSTEM_CONFIG = {
  // Primary build system (Webpack is primary, Vite is disabled)
  primary: "webpack" as const,
  secondary: null, // Vite is disabled

  // Build system validation
  validation: {
    enforceWebpackOnly: true,
    preventViteConflicts: true,
    validateEnvironment: true,
    requireTempoRoutes: true,
  },

  webpack: {
    enabled: true,
    configFile: "webpack.config.cjs",
    devServer: {
      port: 3001,
      host: "0.0.0.0",
      allowedHosts: "all",
      historyApiFallback: true,
      hot: true,
    },
    optimization: {
      splitChunks: true,
      minimize: true,
      treeshaking: true,
    },
    features: {
      tempoRoutes: true,
      hotReload: true,
      sourceMap: true,
      bundleAnalysis: false,
      environmentValidation: true,
      gracefulDegradation: true,
    },
    errorHandling: {
      tempoRoutesFallback: true,
      environmentValidation: true,
      gracefulDegradation: true,
      detailedLogging: true,
    },
  },

  vite: {
    enabled: false, // Explicitly disabled to avoid conflicts
    configFile: "vite.config.ts",
    reason: "Disabled to prevent build system conflicts with Webpack",
    status: "COMPLETELY_DISABLED",
    conflictPrevention: {
      removeViteReferences: true,
      disableViteScripts: true,
      preventViteImports: true,
    },
    migration: {
      planned: false,
      blockers: [
        "Tempo devtools integration",
        "Complex webpack-specific configurations",
        "Custom module resolution",
        "Environment variable handling",
        "Route management system",
      ],
    },
  },
} as const;

export const TEMPO_INTEGRATION_CONFIG = {
  enabled: true,
  routesPath: "src/tempobook/routes.js",
  storyboardsPath: "src/tempobook/storyboards",
  dynamicPath: "src/tempobook/dynamic",
  devtoolsPackage: "tempo-devtools",
  version: "2.0.106",
  features: {
    storyboards: true,
    dynamicComponents: true,
    hotReload: true,
    errorHandling: true,
  },
  errorHandling: {
    gracefulDegradation: true,
    fallbackRoutes: true,
    consoleLogging: true,
    userNotification: false,
  },
} as const;

export const ENVIRONMENT_DETECTION = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTesting: process.env.NODE_ENV === "test",
  isTempoEnabled: process.env.TEMPO === "true",
  isWebpackBuild: process.env.WEBPACK_BUILD === "true",
  buildTimestamp: new Date().toISOString(),
} as const;

export class BuildConfigValidator {
  private static instance: BuildConfigValidator;
  private validationErrors: string[] = [];
  private validationWarnings: string[] = [];

  private constructor() {
    this.validateBuildConfiguration();
  }

  public static getInstance(): BuildConfigValidator {
    if (!BuildConfigValidator.instance) {
      BuildConfigValidator.instance = new BuildConfigValidator();
    }
    return BuildConfigValidator.instance;
  }

  private validateBuildConfiguration(): void {
    // Critical: Check for build system conflicts
    if (
      BUILD_SYSTEM_CONFIG.webpack.enabled &&
      BUILD_SYSTEM_CONFIG.vite.enabled
    ) {
      this.validationErrors.push(
        "CRITICAL: Both Webpack and Vite are enabled - this will cause conflicts",
      );
    }

    // Enforce Webpack-only configuration
    if (!BUILD_SYSTEM_CONFIG.webpack.enabled) {
      this.validationErrors.push(
        "CRITICAL: Webpack must be enabled as the primary build system",
      );
    }

    if (BUILD_SYSTEM_CONFIG.vite.enabled) {
      this.validationErrors.push(
        "CRITICAL: Vite must be disabled to prevent conflicts with Webpack",
      );
    }

    // Validate Tempo configuration with enhanced checks
    if (
      TEMPO_INTEGRATION_CONFIG.enabled &&
      !ENVIRONMENT_DETECTION.isTempoEnabled
    ) {
      this.validationWarnings.push(
        "Tempo integration is configured but TEMPO environment variable is not set",
      );
    }

    // Validate Tempo routes setup
    if (TEMPO_INTEGRATION_CONFIG.enabled) {
      const tempoRoutesPath = TEMPO_INTEGRATION_CONFIG.routesPath;
      if (!tempoRoutesPath) {
        this.validationErrors.push("Tempo routes path is not configured");
      }
    }

    // Enhanced environment variable validation
    const environmentValidation = this.validateEnvironmentVariables();
    this.validationErrors.push(...environmentValidation.errors);
    this.validationWarnings.push(...environmentValidation.warnings);

    // Check for required files
    const requiredFiles = [
      BUILD_SYSTEM_CONFIG.webpack.configFile,
      "package.json",
      "tsconfig.json",
    ];

    // Validate file existence (simplified check)
    requiredFiles.forEach((file) => {
      // Note: In browser environment, we can't check file existence
      // This would need to be done during build time
    });

    // Validate Tempo devtools version with enhanced error handling
    if (TEMPO_INTEGRATION_CONFIG.enabled) {
      try {
        // Note: This require might fail in browser environment
        // Consider moving this validation to build time
        const packageJson = require("../../../package.json");
        const tempoVersion = packageJson.devDependencies?.["tempo-devtools"];
        if (!tempoVersion) {
          this.validationErrors.push(
            "Tempo devtools package not found in devDependencies",
          );
        } else if (!tempoVersion.includes(TEMPO_INTEGRATION_CONFIG.version)) {
          this.validationWarnings.push(
            `Tempo devtools version mismatch: expected ${TEMPO_INTEGRATION_CONFIG.version}, found ${tempoVersion}`,
          );
        }
      } catch (error) {
        this.validationWarnings.push(
          "Could not validate Tempo devtools version - this is expected in browser environment",
        );
      }
    }
  }

  private validateEnvironmentVariables(): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const environment = process.env.NODE_ENV || "development";

    // Define required environment variables by environment
    const requiredEnvVars = {
      development: ["NODE_ENV"],
      production: ["NODE_ENV", "SUPABASE_URL", "SUPABASE_ANON_KEY"],
      test: ["NODE_ENV"],
    };

    const optionalEnvVars = [
      "TEMPO",
      "WEBPACK_BUILD",
      "API_BASE_URL",
      "BUILD_VERSION",
    ];

    // Check required variables
    const required =
      requiredEnvVars[environment as keyof typeof requiredEnvVars] ||
      requiredEnvVars.development;
    required.forEach((envVar) => {
      if (!process.env[envVar]) {
        errors.push(
          `Missing required environment variable for ${environment}: ${envVar}`,
        );
      }
    });

    // Check optional but recommended variables
    optionalEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        warnings.push(`Optional environment variable not set: ${envVar}`);
      }
    });

    // Validate URL format for specific variables
    const urlVars = ["SUPABASE_URL", "API_BASE_URL"];
    urlVars.forEach((envVar) => {
      const value = process.env[envVar];
      if (value && !this.isValidUrl(value)) {
        errors.push(`Invalid URL format for ${envVar}: ${value}`);
      }
    });

    return { errors, warnings };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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

  public getBuildConfig(): BuildConfig {
    return {
      buildSystem: BUILD_SYSTEM_CONFIG.primary,
      environment: (process.env.NODE_ENV as any) || "development",
      tempoEnabled:
        TEMPO_INTEGRATION_CONFIG.enabled &&
        ENVIRONMENT_DETECTION.isTempoEnabled,
      sourceMap: ENVIRONMENT_DETECTION.isDevelopment,
      optimization: ENVIRONMENT_DETECTION.isProduction,
      bundleAnalysis: false,
      hotReload: ENVIRONMENT_DETECTION.isDevelopment,
      publicPath: "/",
      outputPath: "dist",
      assetsPath: "assets",
    };
  }

  public getStatusReport(): {
    status: "valid" | "warning" | "error";
    message: string;
    details: {
      errors: string[];
      warnings: string[];
      config: BuildConfig;
      environment: typeof ENVIRONMENT_DETECTION;
    };
  } {
    if (this.validationErrors.length > 0) {
      return {
        status: "error",
        message: `Build configuration has ${this.validationErrors.length} error(s)`,
        details: {
          errors: this.validationErrors,
          warnings: this.validationWarnings,
          config: this.getBuildConfig(),
          environment: ENVIRONMENT_DETECTION,
        },
      };
    }

    if (this.validationWarnings.length > 0) {
      return {
        status: "warning",
        message: `Build configuration has ${this.validationWarnings.length} warning(s)`,
        details: {
          errors: this.validationErrors,
          warnings: this.validationWarnings,
          config: this.getBuildConfig(),
          environment: ENVIRONMENT_DETECTION,
        },
      };
    }

    return {
      status: "valid",
      message: "Build configuration is valid",
      details: {
        errors: [],
        warnings: [],
        config: this.getBuildConfig(),
        environment: ENVIRONMENT_DETECTION,
      },
    };
  }

  public logStatus(): void {
    const report = this.getStatusReport();

    console.log("🔧 Build Configuration Status:");
    console.log(`   Status: ${report.status.toUpperCase()}`);
    console.log(`   Message: ${report.message}`);

    if (report.details.errors.length > 0) {
      console.error("❌ Build Configuration Errors:");
      report.details.errors.forEach((error) => console.error(`   • ${error}`));
    }

    if (report.details.warnings.length > 0) {
      console.warn("⚠️ Build Configuration Warnings:");
      report.details.warnings.forEach((warning) =>
        console.warn(`   • ${warning}`),
      );
    }

    console.log("📋 Build Configuration:");
    console.log(`   Build System: ${report.details.config.buildSystem}`);
    console.log(`   Environment: ${report.details.config.environment}`);
    console.log(`   Tempo Enabled: ${report.details.config.tempoEnabled}`);
    console.log(`   Hot Reload: ${report.details.config.hotReload}`);
    console.log(`   Source Maps: ${report.details.config.sourceMap}`);
    console.log(`   Optimization: ${report.details.config.optimization}`);
  }
}

// Export singleton instance
export const buildConfigValidator = BuildConfigValidator.getInstance();

// Export configuration getters
export const getBuildConfig = (): BuildConfig => {
  return buildConfigValidator.getBuildConfig();
};

export const isBuildValid = (): boolean => {
  return buildConfigValidator.isValid();
};

export default buildConfigValidator;
