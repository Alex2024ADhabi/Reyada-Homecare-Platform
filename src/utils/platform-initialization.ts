// Platform Initialization Utilities
// Centralized initialization logic for the Reyada Homecare Platform

import { environmentValidator } from "@/utils/environment-validator";
import { smartComputationEngine } from "@/engines/computation.engine";
import { formGenerationEngine } from "@/engines/form-generation.engine";
import { workflowEngine } from "@/engines/workflow.engine";
import { platformOrchestratorService } from "@/services/platform-orchestrator.service";
import { aiHubService } from "@/services/ai-hub.service";

export interface InitializationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  services: {
    environment: boolean;
    engines: boolean;
    orchestrator: boolean;
    tempo: boolean;
    database: boolean;
    aiHub: boolean;
  };
  performance: {
    initTime: number;
    memoryUsage?: number;
  };
}

export class PlatformInitializer {
  private static instance: PlatformInitializer;
  private initializationResult: InitializationResult | null = null;
  private startTime: number = 0;

  private constructor() {}

  public static getInstance(): PlatformInitializer {
    if (!PlatformInitializer.instance) {
      PlatformInitializer.instance = new PlatformInitializer();
    }
    return PlatformInitializer.instance;
  }

  public async initialize(): Promise<InitializationResult> {
    this.startTime = performance.now();
    console.log("🚀 Starting Reyada Homecare Platform initialization...");

    const result: InitializationResult = {
      success: false,
      errors: [],
      warnings: [],
      services: {
        environment: false,
        engines: false,
        orchestrator: false,
        tempo: false,
        database: false,
        aiHub: false,
      },
      performance: {
        initTime: 0,
        memoryUsage: 0,
      },
    };

    try {
      // Phase 1: Environment Validation
      console.log("🔧 Phase 1: Validating environment configuration...");
      await this.initializeEnvironment(result);

      // Phase 2: Dynamic Engines Initialization
      console.log("⚙️ Phase 2: Initializing dynamic engines...");
      await this.initializeEngines(result);

      // Phase 3: Platform Orchestrator Initialization
      console.log("🎯 Phase 3: Initializing platform orchestrator...");
      await this.initializeOrchestrator(result);

      // Phase 4: Tempo Integration
      console.log("⚡ Phase 4: Setting up Tempo integration...");
      await this.initializeTempo(result);

      // Phase 5: AI Hub Initialization
      console.log("🤖 Phase 5: Initializing AI Hub...");
      await this.initializeAIHub(result);

      // Phase 6: Database Schema Validation
      console.log("🗄️ Phase 6: Validating database schema...");
      await this.initializeDatabase(result);

      // Calculate performance metrics
      result.performance.initTime = performance.now() - this.startTime;
      if ((performance as any).memory) {
        result.performance.memoryUsage = (
          performance as any
        ).memory.usedJSHeapSize;
      }

      // Determine overall success
      result.success = result.errors.length === 0;

      // Log final status
      this.logInitializationResult(result);

      this.initializationResult = result;
      return result;
    } catch (error: any) {
      console.error("❌ Critical initialization failure:", error);
      result.errors.push(`Critical initialization failure: ${error.message}`);
      result.performance.initTime = performance.now() - this.startTime;
      this.initializationResult = result;
      return result;
    }
  }

  private async initializeEnvironment(
    result: InitializationResult,
  ): Promise<void> {
    try {
      const envStatus = environmentValidator.getStatusReport();

      if (envStatus.status === "error") {
        result.errors.push(...envStatus.details.errors);
        console.error("   ❌ Critical environment errors detected:");
        envStatus.details.errors.forEach((error) =>
          console.error(`     • ${error}`),
        );
      }

      if (envStatus.status === "warning") {
        result.warnings.push(...envStatus.details.warnings);
        console.warn("   ⚠️ Environment warnings:");
        envStatus.details.warnings.forEach((warning) =>
          console.warn(`     • ${warning}`),
        );
      }

      // Enhanced environment validation with specific checks
      const additionalValidation =
        this.performAdditionalEnvironmentValidation();
      result.errors.push(...additionalValidation.errors);
      result.warnings.push(...additionalValidation.warnings);

      result.services.environment =
        envStatus.status !== "error" &&
        additionalValidation.errors.length === 0;
      console.log(
        `   Environment: ${envStatus.status.toUpperCase()} - ${envStatus.message}`,
      );

      // Log environment configuration summary
      this.logEnvironmentSummary(envStatus.details.config);
    } catch (error: any) {
      result.errors.push(`Environment validation failed: ${error.message}`);
      console.error("   ❌ Environment validation failed:", error);
    }
  }

  private performAdditionalEnvironmentValidation(): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for build system conflicts
    const webpackBuild = process.env.WEBPACK_BUILD === "true";
    const viteBuild = process.env.VITE === "true";

    if (webpackBuild && viteBuild) {
      errors.push(
        "Build system conflict: Both WEBPACK_BUILD and VITE are enabled",
      );
    }

    if (!webpackBuild && !viteBuild) {
      warnings.push(
        "No build system explicitly enabled - defaulting to Webpack",
      );
    }

    // Validate Tempo configuration
    const tempoEnabled = process.env.TEMPO === "true";
    const nodeEnv = process.env.NODE_ENV;

    if (tempoEnabled && nodeEnv === "production") {
      warnings.push(
        "Tempo is enabled in production environment - ensure this is intentional",
      );
    }

    // Enhanced security validation
    this.validateSecurityConfiguration(errors, warnings);

    // Enhanced compliance validation
    this.validateComplianceConfiguration(errors, warnings);

    // Check for missing production variables
    if (nodeEnv === "production") {
      const productionVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
      productionVars.forEach((varName) => {
        if (!process.env[varName]) {
          errors.push(
            `Missing required production environment variable: ${varName}`,
          );
        }
      });
    }

    return { errors, warnings };
  }

  private async initializeAIHub(result: InitializationResult): Promise<void> {
    try {
      console.log("   🤖 Starting AI Hub initialization...");
      await aiHubService.initialize();

      // Verify AI Hub health
      const isHealthy = await aiHubService.healthCheck();
      if (isHealthy) {
        result.services.aiHub = true;
        console.log("   ✅ AI Hub initialized successfully");
      } else {
        result.warnings.push("AI Hub initialized but health check failed");
        result.services.aiHub = false;
        console.warn("   ⚠️ AI Hub health check failed");
      }
    } catch (error: any) {
      result.errors.push(`AI Hub initialization failed: ${error.message}`);
      console.error("   ❌ AI Hub initialization failed:", error);
    }
  }

  private validateSecurityConfiguration(
    errors: string[],
    warnings: string[],
  ): void {
    // Validate CSP configuration
    const cspEnabled = process.env.CSP_ENABLED !== "false";
    if (!cspEnabled) {
      warnings.push(
        "Content Security Policy is disabled - this reduces security",
      );
    }

    // Validate HTTPS enforcement
    const httpsEnforced = process.env.HTTPS_ONLY === "true";
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "production" && !httpsEnforced) {
      errors.push("HTTPS enforcement is required in production environment");
    }

    // Validate encryption configuration
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (nodeEnv === "production" && !encryptionKey) {
      errors.push("Encryption key is required for production environment");
    }

    // Validate session security
    const sessionSecret = process.env.SESSION_SECRET;
    if (nodeEnv === "production" && !sessionSecret) {
      errors.push("Session secret is required for production environment");
    }
  }

  private validateComplianceConfiguration(
    errors: string[],
    warnings: string[],
  ): void {
    const nodeEnv = process.env.NODE_ENV;

    // DOH compliance validation
    const dohCompliance = process.env.DOH_COMPLIANCE_ENABLED === "true";
    if (nodeEnv === "production" && !dohCompliance) {
      errors.push("DOH compliance must be enabled in production environment");
    }

    // DAMAN integration validation
    const damanEnabled = process.env.DAMAN_INTEGRATION_ENABLED === "true";
    const damanApiKey = process.env.DAMAN_API_KEY;
    if (damanEnabled && !damanApiKey) {
      errors.push(
        "DAMAN API key is required when DAMAN integration is enabled",
      );
    }

    // ADHICS V2 compliance validation
    const adhicsCompliance = process.env.ADHICS_V2_COMPLIANCE === "true";
    if (nodeEnv === "production" && !adhicsCompliance) {
      warnings.push(
        "ADHICS V2 compliance is not explicitly enabled - ensure compliance requirements are met",
      );
    }

    // Audit logging validation
    const auditLogging = process.env.AUDIT_LOGGING_ENABLED !== "false";
    if (!auditLogging) {
      warnings.push(
        "Audit logging is disabled - this may affect compliance requirements",
      );
    }
  }

  private logEnvironmentSummary(config: any): void {
    console.log("   📋 Environment Configuration Summary:");
    console.log(`     NODE_ENV: ${config.NODE_ENV || "undefined"}`);
    console.log(`     TEMPO: ${config.TEMPO || "undefined"}`);
    console.log(
      `     Build System: ${process.env.WEBPACK_BUILD === "true" ? "Webpack" : "Unknown"}`,
    );
    console.log(
      `     Supabase: ${config.SUPABASE_URL ? "Configured" : "Not configured"}`,
    );
    console.log(`     API Base URL: ${config.API_BASE_URL || "Not set"}`);
  }

  private async initializeEngines(result: InitializationResult): Promise<void> {
    try {
      console.log("   🧠 Initializing Smart Computation Engine...");
      await smartComputationEngine.initialize();

      console.log("   📝 Initializing Form Generation Engine...");
      await formGenerationEngine.initialize();

      console.log("   🔄 Initializing Workflow Engine...");
      await workflowEngine.initialize();

      result.services.engines = true;
      console.log("   ✅ All dynamic engines initialized successfully");
    } catch (error: any) {
      result.errors.push(`Engine initialization failed: ${error.message}`);
      console.error("   ❌ Engine initialization failed:", error);
    }
  }

  private async initializeOrchestrator(
    result: InitializationResult,
  ): Promise<void> {
    try {
      console.log("   🎯 Starting platform orchestration...");
      const orchestrationReport =
        await platformOrchestratorService.executeComprehensiveOrchestration();

      if (orchestrationReport.isProductionReady) {
        result.services.orchestrator = true;
        console.log(
          "   ✅ Platform orchestrator initialized - Production Ready!",
        );
      } else {
        result.warnings.push(
          `Platform orchestration completed with ${orchestrationReport.completionPercentage}% completion`,
        );
        result.services.orchestrator =
          orchestrationReport.completionPercentage >= 90;
        console.log(
          `   ⚠️ Platform orchestrator initialized - ${orchestrationReport.completionPercentage}% complete`,
        );
      }
    } catch (error: any) {
      result.errors.push(
        `Platform orchestrator initialization failed: ${error.message}`,
      );
      console.error(
        "   ❌ Platform orchestrator initialization failed:",
        error,
      );
    }
  }

  private async initializeTempo(result: InitializationResult): Promise<void> {
    try {
      if (process.env.TEMPO === "true") {
        console.log("   🔧 Initializing Tempo integration...");

        // Enhanced Tempo routes validation
        const tempoRoutesValidation = this.validateTempoRoutes();
        if (tempoRoutesValidation.errors.length > 0) {
          result.errors.push(...tempoRoutesValidation.errors);
          console.error("   ❌ Tempo routes validation failed:");
          tempoRoutesValidation.errors.forEach((error) =>
            console.error(`     • ${error}`),
          );
        }

        if (tempoRoutesValidation.warnings.length > 0) {
          result.warnings.push(...tempoRoutesValidation.warnings);
          console.warn("   ⚠️ Tempo routes warnings:");
          tempoRoutesValidation.warnings.forEach((warning) =>
            console.warn(`     • ${warning}`),
          );
        }

        // Validate Tempo devtools
        try {
          const tempoModule = await import("tempo-devtools");
          const TempoDevtools =
            tempoModule?.TempoDevtools || tempoModule?.default;

          if (TempoDevtools && typeof TempoDevtools.init === "function") {
            await TempoDevtools.init();
            result.services.tempo = tempoRoutesValidation.errors.length === 0;
            console.log("   ✅ Tempo devtools initialized successfully");
          } else {
            result.warnings.push(
              "Tempo devtools module found but init function not available",
            );
            console.warn("   ⚠️ Tempo devtools init function not available");
            result.services.tempo = false;
          }
        } catch (tempoError: any) {
          result.warnings.push(
            `Tempo devtools initialization failed: ${tempoError.message}`,
          );
          console.warn(
            "   ⚠️ Tempo devtools initialization failed:",
            tempoError.message,
          );
          result.services.tempo = false;
        }
      } else {
        result.services.tempo = true; // Not required in production
        console.log("   ✅ Tempo integration skipped (not enabled)");
      }
    } catch (error: any) {
      result.warnings.push(`Tempo setup failed: ${error.message}`);
      console.warn("   ⚠️ Tempo setup failed:", error);
      result.services.tempo = false;
    }
  }

  private validateTempoRoutes(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if tempo routes can be loaded
      let tempoRoutes;
      const loadStrategies = [
        () => require("tempo-routes"),
        () => require("@/tempobook/routes.js"),
        () => require("./tempobook/routes.js"),
      ];

      let loadSuccess = false;
      for (const strategy of loadStrategies) {
        try {
          tempoRoutes = strategy();
          if (tempoRoutes) {
            loadSuccess = true;
            break;
          }
        } catch (strategyError) {
          // Continue to next strategy
        }
      }

      if (!loadSuccess) {
        warnings.push(
          "Tempo routes could not be loaded - using fallback empty routes",
        );
      } else {
        // Validate routes structure
        const routes = tempoRoutes?.default || tempoRoutes || [];
        if (!Array.isArray(routes)) {
          warnings.push(
            "Tempo routes is not an array - will be converted to array",
          );
        } else {
          console.log(
            `   📋 Tempo routes validated: ${routes.length} routes found`,
          );
        }
      }
    } catch (error: any) {
      errors.push(`Tempo routes validation failed: ${error.message}`);
    }

    return { errors, warnings };
  }

  private async initializeDatabase(
    result: InitializationResult,
  ): Promise<void> {
    try {
      // Validate database schema configuration
      const { CORE_HEALTHCARE_SCHEMA } = await import(
        "@/config/core-healthcare-schema"
      );

      if (
        CORE_HEALTHCARE_SCHEMA &&
        typeof CORE_HEALTHCARE_SCHEMA === "object"
      ) {
        const tableCount = Object.keys(CORE_HEALTHCARE_SCHEMA).length;
        result.services.database = true;
        console.log(
          `   ✅ Database schema validated (${tableCount} tables defined)`,
        );
      } else {
        result.warnings.push(
          "Database schema configuration not found or invalid",
        );
        console.warn("   ⚠️ Database schema configuration not found");
      }
    } catch (error: any) {
      result.warnings.push(
        `Database schema validation failed: ${error.message}`,
      );
      console.warn("   ⚠️ Database schema validation failed:", error);
    }
  }

  private logInitializationResult(result: InitializationResult): void {
    console.log("\n📊 Platform Initialization Summary:");
    console.log(
      `   Overall Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`,
    );
    console.log(
      `   Initialization Time: ${result.performance.initTime.toFixed(2)}ms`,
    );

    if (result.performance.memoryUsage) {
      console.log(
        `   Memory Usage: ${(result.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    console.log("\n🔧 Service Status:");
    Object.entries(result.services).forEach(([service, status]) => {
      const serviceNames = {
        environment: "Environment Validation",
        engines: "Dynamic Engines",
        orchestrator: "Platform Orchestrator",
        tempo: "Tempo Integration",
        database: "Database Schema",
        aiHub: "AI Hub Service",
      };
      console.log(
        `   ${serviceNames[service as keyof typeof serviceNames] || service}: ${status ? "✅" : "❌"}`,
      );
    });

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach((error) => console.log(`   • ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠️ Warnings:");
      result.warnings.forEach((warning) => console.log(`   • ${warning}`));
    }

    console.log("\n🎉 Reyada Homecare Platform initialization completed!");
    console.log(
      "© 2024 Reyada Home Health Care Services L.L.C. All rights reserved.\n",
    );
  }

  public getInitializationResult(): InitializationResult | null {
    return this.initializationResult;
  }

  public isInitialized(): boolean {
    return this.initializationResult !== null;
  }

  public isSuccessful(): boolean {
    return this.initializationResult?.success || false;
  }
}

// Export singleton instance
export const platformInitializer = PlatformInitializer.getInstance();

// Export convenience functions
export const initializePlatform = async (): Promise<InitializationResult> => {
  return await platformInitializer.initialize();
};

export const getPlatformStatus = (): InitializationResult | null => {
  return platformInitializer.getInitializationResult();
};

export const isPlatformReady = (): boolean => {
  return platformInitializer.isSuccessful();
};

export default platformInitializer;
